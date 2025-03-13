import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubDepositErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubDepositErrorCode";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubDepositCharge } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositCharge";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";
import { HubDepositChargePublishProvider } from "./HubDepositChargePublishProvider";

export namespace HubDepositChargeProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_deposit_chargesGetPayload<ReturnType<typeof select>>,
    ): IHubDepositCharge => ({
      id: input.id,
      customer: HubCustomerProvider.json.transform(input.customer),
      value: input.value,
      created_at: input.created_at.toISOString(),
      publish:
        input.publish === null
          ? null
          : HubDepositChargePublishProvider.json.transform(input.publish),
    });
    export const select = () =>
      ({
        include: {
          customer: HubCustomerProvider.json.select(),
          publish: HubDepositChargePublishProvider.json.select(),
        },
      }) satisfies Prisma.hub_deposit_chargesFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    customer: IHubCustomer;
    input: IHubDepositCharge.IRequest;
  }): Promise<IPage<IHubDepositCharge>> =>
    PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_deposit_charges,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        AND: [
          HubCustomerProvider.where(props.customer),
          ...search(props.input.search),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.hub_deposit_chargesFindManyArgs)(props.input);

  const search = (input: IHubDepositCharge.IRequest.ISearch | undefined) =>
    [
      ...(input?.minimum !== undefined
        ? [{ value: { gte: input.minimum } }]
        : []),
      ...(input?.maximum !== undefined
        ? [{ value: { lte: input.maximum } }]
        : []),
      ...(input?.from !== undefined
        ? [{ created_at: { gte: new Date(input.from) } }]
        : []),
      ...(input?.to !== undefined
        ? [{ created_at: { lte: new Date(input.to) } }]
        : []),
      ...(input?.state === "pending" ? [{ publish: { is: null } }] : []),
      ...(input?.state === "published" ? [{ publish: { isNot: null } }] : []),
      ...(input?.state === "paid"
        ? [{ publish: { paid_at: { not: null } } }]
        : []),
      ...(input?.state === "cancelled"
        ? [{ publish: { cancelled_at: { not: null } } }]
        : []),
      ...(input?.publish?.from?.length
        ? [{ publish: { created_at: { gte: input.publish.from } } }]
        : []),
      ...(input?.publish?.to?.length
        ? [{ publish: { created_at: { lte: input.publish.to } } }]
        : []),
      ...(input?.publish?.payment?.from?.length
        ? [
            {
              publish: {
                paid_at: {
                  gte: input.publish.payment.from,
                },
              },
            },
          ]
        : []),
      ...(input?.publish?.payment?.to?.length
        ? [
            {
              publish: {
                paid_at: {
                  lte: input.publish.payment.to,
                },
              },
            },
          ]
        : []),
    ] satisfies Prisma.hub_deposit_chargesWhereInput["AND"];

  const orderBy = (
    key: IHubDepositCharge.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "created_at"
      ? { created_at: value }
      : key === "value"
        ? { value: value }
        : key === "publish.created_at"
          ? { publish: { created_at: value } }
          : key === "publish.paid_at"
            ? { publish: { paid_at: value } }
            : {
                publish: { cancelled_at: value },
              }) satisfies Prisma.hub_deposit_chargesOrderByWithRelationInput;

  export const at = async (props: {
    customer: IHubCustomer;
    id: string;
  }): Promise<IHubDepositCharge> => {
    const record = await HubGlobal.prisma.hub_deposit_charges.findFirstOrThrow({
      where: {
        id: props.id,
        customer: HubCustomerProvider.where(props.customer),
      },
      ...json.select(),
    });
    return json.transform(record);
  };

  /* -----------------------------------------------------------
            STORE
        ----------------------------------------------------------- */
  export const create = async (props: {
    customer: IHubCustomer;
    input: IHubDepositCharge.ICreate;
  }): Promise<IHubDepositCharge> => {
    const record = await HubGlobal.prisma.hub_deposit_charges.create({
      data: collect(props),
      ...json.select(),
    });
    return json.transform(record);
  };

  export const update = async (props: {
    customer: IHubCustomer;
    id: string;
    input: IHubDepositCharge.IUpdate;
  }): Promise<void> => {
    const record = await HubGlobal.prisma.hub_deposit_charges.findFirstOrThrow({
      where: {
        id: props.id,
        customer: HubCustomerProvider.where(props.customer),
      },
      include: {
        publish: true,
      },
    });
    if (record.publish !== null)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubDepositErrorCode.ALREADY_PUBLISHED,
        message: "Already published.",
      });
    await HubGlobal.prisma.hub_deposit_charges.update({
      where: { id: record.id },
      data: { value: props.input.value },
    });
  };

  const collect = (props: {
    customer: IHubCustomer;
    input: IHubDepositCharge.ICreate;
  }) => {
    if (props.customer.member === null) {
      throw ErrorProvider.badRequest({
        accessor: "customer",
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You are not a member.",
      });
    }

    return {
      id: v4(),
      customer: { connect: { id: props.customer.id } },
      member: {
        connect: {
          id: props.customer.member.id,
        },
      },
      value: props.input.value,
      created_at: new Date(),
      deleted_at: null,
    } satisfies Prisma.hub_deposit_chargesCreateInput;
  };
}
