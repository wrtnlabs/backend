import { HttpException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubCouponErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubCouponErrorCode";
import { HubCustomerDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/actors/HubCustomerDiagnoser";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubAdministratorProvider } from "../actors/HubAdministratorProvider";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";
import { HubSellerProvider } from "../actors/HubSellerProvider";
import { HubCouponCriterialProvider } from "./HubCouponCriteriaProvider";

export namespace HubCouponProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = async (
      input: Prisma.hub_couponsGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubCoupon> => ({
      id: input.id,
      designer:
        input.actor_type === "administrator"
          ? HubAdministratorProvider.invert.transform(input.customer)
          : HubSellerProvider.invert.transform(input.customer),
      discount:
        input.unit === "amount"
          ? {
              unit: "amount",
              value: input.value,
              threshold: input.threshold,
            }
          : {
              unit: "percent",
              value: input.value,
              threshold: input.threshold,
              limit: input.limit,
            },
      restriction: {
        access: input.access as "public",
        exclusive: input.exclusive,
        volume: input.volume,
        volume_per_citizen: input.volume_per_citizen,
        expired_in: input.expired_in,
        expired_at: input.expired_at?.toISOString() ?? null,
      },
      inventory: {
        volume: input.inventory?.value ?? null,
        volume_per_citizen: input.citizen_inventories?.length
          ? input.citizen_inventories[0].value
          : input.volume_per_citizen,
      },
      criterias: await HubCouponCriterialProvider.json.transform(
        input.criterias.sort((a, b) => a.sequence - b.sequence),
        lang_code,
      ),
      name: input.name,
      created_at: input.created_at.toISOString(),
      opened_at: input.opened_at?.toISOString() ?? null,
      closed_at: input.closed_at?.toISOString() ?? null,
    });
    export const select = (actor: IHubActorEntity) =>
      ({
        include: {
          customer: HubCustomerProvider.json.select(),
          criterias: HubCouponCriterialProvider.json.select(
            actor,
            actor.type === "customer" ? "approved" : "last",
          ),
          inventory: {},
          citizen_inventories:
            actor.type === "customer" && actor.citizen !== null
              ? {
                  select: {
                    value: true,
                  },
                  where: {
                    hub_citizen_id: actor.citizen.id,
                  },
                }
              : undefined,
        },
      }) satisfies Prisma.hub_couponsFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = (props: {
    actor: IHubActorEntity;
    input: IHubCoupon.IRequest;
  }): Promise<IPage<IHubCoupon>> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);

    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_coupons,
      payload: json.select(props.actor),
      transform: (records) => json.transform(records, langCode),
    })({
      where: {
        AND: [
          // SOFT REMOVE
          { deleted_at: null },
          // OWNERSHIP
          ...whereActor(props.actor),
          // POSSIBLE
          ...(props.actor.type === "customer" ? [wherePossible()] : []),
          // SEARCH
          ...search(props.input.search),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.hub_couponsFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    id: string;
  }): Promise<IHubCoupon> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    const record = await find({
      payload: json.select(props.actor),
      exception: (status, message) =>
        ErrorProvider.http(status)({
          accessor: "id",
          code: HubCouponErrorCode.NOT_FOUND,
          message,
        }),
      actor: props.actor,
      id: props.id,
    });
    return json.transform(record, langCode);
  };

  export const find = async <
    Payload extends Prisma.hub_couponsFindFirstArgs,
  >(props: {
    payload: Payload;
    exception: (
      status: number,
      code: HubCouponErrorCode,
      message: string,
    ) => HttpException;
    actor: IHubActorEntity;
    id: string;
  }) => {
    const record = await HubGlobal.prisma.hub_coupons.findFirstOrThrow({
      where: {
        AND: [
          {
            id: props.id,
            deleted_at: null,
          },
          ...whereActor(props.actor),
        ],
      },
      ...props.payload,
    });
    if (props.actor.type === "customer")
      if (record.opened_at === null || record.opened_at > new Date())
        throw props.exception(
          422,
          HubCouponErrorCode.NOT_OPENED,
          "The coupon has not been opened yet.",
        );
      else if (record.closed_at && record.closed_at <= new Date())
        throw props.exception(
          410,
          HubCouponErrorCode.CLOSED,
          "The coupon has been closed.",
        );
      else if (record.expired_at && record.expired_at <= new Date())
        throw props.exception(
          410,
          HubCouponErrorCode.EXPIRED,
          "The coupon has been expired.",
        );
    return record as Prisma.hub_couponsGetPayload<typeof props.payload>;
  };

  const whereActor = (actor: IHubActorEntity) =>
    [
      {
        customer: {
          channel: {
            id: HubCustomerDiagnoser.invert(actor).channel.id,
          },
        },
        ...(actor.type === "seller"
          ? [
              {
                OR: [
                  {
                    actor_type: "seller",
                    customer: {
                      member: {
                        of_seller: {
                          id: actor.id,
                        },
                      },
                    },
                  },
                  {
                    actor_type: "administrator",
                  },
                ],
              },
            ]
          : []),
      },
    ] satisfies Prisma.hub_couponsWhereInput["AND"];

  export const wherePossible = () =>
    ({
      AND: [
        {
          opened_at: { lte: new Date() },
        },
        {
          OR: [{ closed_at: null }, { closed_at: { gt: new Date() } }],
        },
        {
          OR: [{ expired_at: null }, { expired_at: { gt: new Date() } }],
        },
        {
          OR: [{ volume: null }, { inventory: { value: { gt: 0 } } }],
        },
        {
          OR: [
            { volume_per_citizen: null },
            { citizen_inventories: { every: { value: { gt: 0 } } } },
          ],
        },
      ],
    }) satisfies Prisma.hub_couponsWhereInput;

  const search = (input: IHubCoupon.IRequest.ISearch | undefined) =>
    [
      ...(input?.name?.length
        ? [
            {
              name: {
                contains: input.name,
              },
            },
          ]
        : [{}]),
    ] satisfies Prisma.hub_couponsWhereInput["AND"];

  const orderBy = (
    key: IHubCoupon.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ): Prisma.hub_couponsOrderByWithRelationInput =>
    key === "coupon.name"
      ? { name: direction }
      : key === "coupon.created_at"
        ? { created_at: direction }
        : key === "coupon.opened_at"
          ? { opened_at: direction }
          : { closed_at: direction };

  /* -----------------------------------------------------------
          WRITERS 
        ----------------------------------------------------------- */
  export const create = async (props: {
    actor: IHubAdministrator.IInvert | IHubSeller.IInvert;
    input: IHubCoupon.ICreate;
  }): Promise<IHubCoupon> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);

    const record = await HubGlobal.prisma.hub_coupons.create({
      data: await collect(props),
      ...json.select(props.actor),
    });
    return json.transform(record, langCode);
  };

  export const erase = async (props: {
    actor: IHubAdministrator.IInvert | IHubSeller.IInvert;
    id: string;
  }): Promise<void> => {
    // const record =
    await find({
      payload: {},
      exception: (status, code, message) =>
        ErrorProvider.http(status)({ accessor: "id", code, message }),
      actor: props.actor,
      id: props.id,
    });
    // if (record.opened_at !== null && record.opened_at.getTime() <= Date.now())
    //   throw ErrorProvider.gone({
    //     accessor: "id",
    //     message: "The coupon has been already opened.",
    //   });
    await HubGlobal.prisma.hub_coupons.update({
      where: {
        id: props.id,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  };

  export const destroy = async (props: {
    admin: IHubAdministrator.IInvert;
    id: string;
  }): Promise<void> => {
    await HubGlobal.prisma.hub_coupons.delete({
      where: {
        id: props.id,
      },
    });
  };

  const collect = async (props: {
    actor: IHubAdministrator.IInvert | IHubSeller.IInvert;
    input: IHubCoupon.ICreate;
  }) =>
    ({
      id: v4(),
      customer: {
        connect: {
          id: props.actor.customer.id,
        },
      },
      member: {
        connect: {
          id: props.actor.member.id,
        },
      },
      actor_type: props.actor.type,
      name: props.input.name,
      access: props.input.restriction.access,
      exclusive: props.input.restriction.exclusive,
      unit: props.input.discount.unit,
      value: props.input.discount.value,
      threshold:
        props.input.discount.unit === "percent"
          ? props.input.discount.threshold
          : null,
      limit:
        props.input.discount.unit === "percent"
          ? props.input.discount.limit
          : null,
      volume: props.input.restriction.volume,
      volume_per_citizen: props.input.restriction.volume_per_citizen,
      expired_in: props.input.restriction.expired_in,
      expired_at: props.input.restriction.expired_at,
      created_at: new Date(),
      updated_at: new Date(),
      opened_at: props.input.opened_at,
      closed_at: props.input.closed_at,
      deleted_at: null,
      inventory: props.input.restriction.volume
        ? {
            create: {
              value: props.input.restriction.volume,
            },
          }
        : undefined,
      criterias: {
        create: await HubCouponCriterialProvider.collect({
          actor: props.actor,
          inputs: props.input.criterias,
        }),
      },
    }) satisfies Prisma.hub_couponsCreateInput;
}
