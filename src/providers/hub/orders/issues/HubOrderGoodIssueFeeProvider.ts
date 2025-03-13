import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubOrderGoodIssueErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderGoodIssueErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubOrderGoodIssueFee } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueFee";

import { HubGlobal } from "../../../../HubGlobal";
import { PaginationUtil } from "../../../../utils/PaginationUtil";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubOrderGoodIssueFeeAcceptProvider } from "./HubOrderGoodIssueFeeAcceptProvider";
import { HubOrderGoodIssueProvider } from "./HubOrderGoodIssueProvider";

export namespace HubOrderGoodIssueFeeProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_order_good_issue_feesGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubOrderGoodIssueFee => {
      return {
        id: input.id,
        value: input.value,
        accept:
          input.accept !== null
            ? HubOrderGoodIssueFeeAcceptProvider.json.transform(input.accept)
            : null,
        created_at: input.created_at.toISOString(),
      };
    };

    export const select = () =>
      ({
        include: {
          accept: HubOrderGoodIssueFeeAcceptProvider.json.select(),
        },
      }) satisfies Prisma.hub_order_good_issue_feesFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    issue: IEntity;
    input: IHubOrderGoodIssueFee.IRequest;
  }): Promise<IPage<IHubOrderGoodIssueFee>> => {
    await HubOrderGoodIssueProvider.find({
      ...props,
      id: props.issue.id,
      payload: {},
    });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_order_good_issue_fees,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        AND: [
          { hub_order_good_issue_id: props.issue.id },
          ...search(props.input.search),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "asc" }],
    } satisfies Prisma.hub_order_good_issue_feesFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    issue: IEntity;
    id: string;
  }): Promise<IHubOrderGoodIssueFee> => {
    await HubOrderGoodIssueProvider.find({
      ...props,
      id: props.issue.id,
      payload: {},
    });
    const record =
      await HubGlobal.prisma.hub_order_good_issue_fees.findFirstOrThrow({
        where: { id: props.id },
        ...json.select(),
      });
    return json.transform(record);
  };

  const search = (input: IHubOrderGoodIssueFee.IRequest.ISearch | undefined) =>
    [
      ...(input?.min_price !== undefined
        ? [{ value: { gte: input.min_price } }]
        : []),
      ...(input?.max_price !== undefined
        ? [{ value: { lte: input.max_price } }]
        : []),
    ] satisfies Prisma.hub_order_good_issue_feesWhereInput["AND"];

  const orderBy = (
    key: IHubOrderGoodIssueFee.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "fee.created_at"
      ? { created_at: value }
      : {
          value,
        }) satisfies Prisma.hub_order_good_issue_feesOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    seller: IHubSeller.IInvert;
    order: IEntity;
    good: IEntity;
    issue: IEntity;
    input: IHubOrderGoodIssueFee.ICreate;
  }): Promise<IHubOrderGoodIssueFee> => {
    await HubOrderGoodIssueProvider.find({
      ...props,
      actor: props.seller,
      id: props.issue.id,
      payload: {},
    });
    const record = await HubGlobal.prisma.hub_order_good_issue_fees.create({
      data: {
        id: v4(),
        issue: {
          connect: { id: props.issue.id },
        },
        customer: {
          connect: { id: props.seller.customer.id },
        },
        member: {
          connect: {
            id: props.seller.member.id,
          },
        },
        value: props.input.value,
        created_at: new Date(),
        deleted_at: null,
      },
      ...json.select(),
    });
    await HubGlobal.prisma.mv_hub_order_good_issue_fee_aggregates.update({
      where: {
        hub_order_good_issue_id: props.issue.id,
      },
      data: {
        request_count: { increment: 1 },
        request_amount: {
          increment: props.input.value,
        },
      },
    });
    return json.transform(record);
  };

  export const erase = async (props: {
    seller: IHubSeller.IInvert;
    order: IEntity;
    good: IEntity;
    issue: IEntity;
    id: string;
  }): Promise<void> => {
    const record = await at({
      ...props,
      actor: props.seller,
    });
    if (record.accept !== null)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubOrderGoodIssueErrorCode.ISSUE_FEE_ALREADY_ACCEPTED,
        message: "Already accepted.",
      });
    await HubGlobal.prisma.hub_order_good_issue_fees.delete({
      where: { id: props.id },
    });
  };
}
