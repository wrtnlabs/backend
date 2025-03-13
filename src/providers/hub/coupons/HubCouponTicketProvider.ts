import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubCouponErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubCouponErrorCode";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCitizen } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCitizen";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubCouponTicket } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponTicket";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";
import { HubCouponProvider } from "./HubCouponProvider";

export namespace HubCouponTicketProvider {
  /* -----------------------------------------------------------
      TRANSFORMERS
    ----------------------------------------------------------- */
  export namespace json {
    export const transform = async (
      input: Prisma.hub_coupon_ticketsGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubCouponTicket> => ({
      id: input.id,
      customer: HubCustomerProvider.json.transform(input.customer),
      coupon: await HubCouponProvider.json.transform(input.coupon, lang_code),
      created_at: input.created_at.toISOString(),
      expired_at: input.expired_at?.toISOString() ?? null,
    });
    export const select = (actor: IHubActorEntity) =>
      ({
        include: {
          customer: HubCustomerProvider.json.select(),
          coupon: HubCouponProvider.json.select(actor),
        },
      }) satisfies Prisma.hub_coupon_ticketsFindManyArgs;
  }

  export const index = async (props: {
    customer: IHubCustomer;
    input: IHubCouponTicket.IRequest;
  }): Promise<IPage<IHubCouponTicket>> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.customer);
    authorize(props.customer);

    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_coupon_tickets,
      payload: json.select(props.customer),
      transform: (records) => json.transform(records, langCode),
    })({
      where: {
        AND: [
          { customer: HubCustomerProvider.where(props.customer) },
          { payment: null },
          {
            OR: [{ expired_at: null }, { expired_at: { gt: new Date() } }],
          },
        ],
      },
      orderBy: [{ created_at: "asc" }],
    } satisfies Prisma.hub_coupon_ticketsFindManyArgs)(props.input);
  };

  export const where = (customer: IHubCustomer) => {
    authorize(customer);
    return {
      AND: [
        { customer: HubCustomerProvider.where(customer) },
        { payment: null },
        {
          OR: [{ expired_at: null }, { expired_at: { gt: new Date() } }],
        },
      ],
    } satisfies Prisma.hub_coupon_ticketsWhereInput;
  };

  export const at = async (props: {
    customer: IHubCustomer;
    id: string;
  }): Promise<IHubCouponTicket> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.customer);
    authorize(props.customer);
    const record = await HubGlobal.prisma.hub_coupon_tickets.findFirstOrThrow({
      where: {
        id: props.id,
        customer: HubCustomerProvider.where(props.customer),
      },
      ...json.select(props.customer),
    });
    const payment = await HubGlobal.prisma.hub_coupon_ticket_payments.findFirst(
      {
        where: {
          hub_coupon_ticket_id: record.id,
        },
      },
    );

    if (payment !== null)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubCouponErrorCode.ALREADY_USED,
        message: "Coupon ticket has been paid.",
      });
    if (record.expired_at !== null && record.expired_at < new Date())
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubCouponErrorCode.EXPIRED,
        message: "Coupon ticket has been expired.",
      });
    return json.transform(record, langCode);
  };

  export const create = async (props: {
    customer: IHubCustomer;
    input: IHubCouponTicket.ICreate;
  }): Promise<IHubCouponTicket> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.customer);
    const coupon: IHubCoupon = await HubCouponProvider.at({
      actor: props.customer,
      id: props.input.coupon_id,
    });
    if (coupon.inventory.volume !== null && coupon.inventory.volume < 1)
      throw ErrorProvider.gone({
        accessor: "input.coupon_id",
        code: HubCouponErrorCode.OUT_OF_STOCK,
        message: "The quantity of the coupon has run out.",
      });
    else if (
      coupon.inventory.volume_per_citizen !== null &&
      coupon.inventory.volume_per_citizen < 1
    )
      throw ErrorProvider.gone({
        accessor: "input.coupon_id",
        code: HubCouponErrorCode.OUT_OF_STOCK,
        message: "The number of coupons issued per citizen has been exceeded.",
      });
    else if (
      coupon.restriction.expired_at !== null &&
      new Date(coupon.restriction.expired_at) < new Date()
    )
      throw ErrorProvider.gone({
        accessor: "input.coupon_id",
        code: HubCouponErrorCode.EXPIRED,
        message: "Coupon has been expired.",
      });

    const record = await HubGlobal.prisma.hub_coupon_tickets.create({
      data: {
        id: v4(),
        hub_customer_id: props.customer.id,
        hub_member_id:
          props.customer.member === null ? undefined : props.customer.member.id,
        hub_coupon_id: coupon.id,
        hub_coupon_disposable_id: null,
        created_at: new Date(),
        expired_at:
          coupon.restriction.expired_at !== null &&
          coupon.restriction.expired_in !== null
            ? new Date(
                Math.min(
                  new Date(coupon.restriction.expired_at).getTime(),
                  Date.now() +
                    coupon.restriction.expired_in * 24 * 60 * 60 * 1000,
                ),
              )
            : coupon.restriction.expired_at !== null
              ? new Date(coupon.restriction.expired_at)
              : coupon.restriction.expired_in !== null
                ? new Date(
                    Date.now() +
                      coupon.restriction.expired_in * 24 * 60 * 60 * 1000,
                  )
                : null,
      },
      ...json.select(props.customer),
    });

    // DECREASE INVENTORY
    if (coupon.inventory.volume !== null)
      await HubGlobal.prisma.mv_hub_coupon_inventories.update({
        where: {
          hub_coupon_id: coupon.id,
        },
        data: {
          value: {
            decrement: 1,
          },
        },
      });
    if (coupon.inventory.volume_per_citizen !== null)
      await HubGlobal.prisma.mv_hub_coupon_citizen_inventories.upsert({
        where: {
          hub_coupon_id_hub_citizen_id: {
            hub_citizen_id: props.customer.citizen!.id,
            hub_coupon_id: coupon.id,
          },
        },
        create: {
          id: v4(),
          hub_coupon_id: coupon.id,
          hub_citizen_id: props.customer.citizen!.id,
          value: coupon.inventory.volume_per_citizen - 1,
        },
        update: {
          value: {
            decrement: 1,
          },
        },
      });

    return json.transform(record, langCode);
  };

  const authorize = (customer: IHubCustomer): IHubCitizen => {
    if (customer.citizen === null)
      throw ErrorProvider.forbidden({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.NOT_CITIZEN,
        message: "Only citizen can use coupon ticket.",
      });
    return customer.citizen;
  };
}
