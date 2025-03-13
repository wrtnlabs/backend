import { Prisma } from "@prisma/client";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubOrderGoodIssueErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderGoodIssueErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubOrderGoodIssue } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssue";

import { HubGlobal } from "../../../../HubGlobal";
import { PaginationUtil } from "../../../../utils/PaginationUtil";
import { BbsArticleProvider } from "../../../common/BbsArticleProvider";
import { BbsArticleSnapshotProvider } from "../../../common/BbsArticleSnapshotProvider";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubActorProvider } from "../../actors/HubActorProvider";
import { HubCustomerProvider } from "../../actors/HubCustomerProvider";
import { HubSellerProvider } from "../../actors/HubSellerProvider";
import { HubOrderGoodProvider } from "../HubOrderGoodProvider";
import { HubOrderGoodIssueFeeProvider } from "./HubOrderGoodIssueFeeProvider";

export namespace HubOrderGoodIssueProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_order_good_issuesGetPayload<ReturnType<typeof select>>,
    ): IHubOrderGoodIssue => ({
      fees: input.fees
        .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
        .map(HubOrderGoodIssueFeeProvider.json.transform),
      writer:
        input.actor_type === "customer"
          ? HubCustomerProvider.json.transform(input.customer)
          : HubSellerProvider.invert.transform(input.customer),
      ...BbsArticleProvider.json.transform(input.base),
    });
    export const select = () =>
      ({
        include: {
          customer: HubCustomerProvider.json.select(),
          base: BbsArticleProvider.json.select(),
          fees: HubOrderGoodIssueFeeProvider.json.select(),
        },
      }) satisfies Prisma.hub_order_good_issuesFindManyArgs;
  }

  export namespace summarize {
    export const transform = (
      input: Prisma.hub_order_good_issuesGetPayload<ReturnType<typeof select>>,
    ): IHubOrderGoodIssue.ISummary => ({
      writer:
        input.actor_type === "customer"
          ? HubCustomerProvider.json.transform(input.customer)
          : HubSellerProvider.invert.transform(input.customer),
      ...BbsArticleProvider.summarize.transform(input.base),
    });
    export const select = () =>
      ({
        include: {
          customer: HubCustomerProvider.json.select(),
          base: BbsArticleProvider.summarize.select(),
        },
      }) satisfies Prisma.hub_order_good_issuesFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    input: IHubOrderGoodIssue.IRequest;
  }): Promise<IPage<IHubOrderGoodIssue.ISummary>> => {
    await HubOrderGoodProvider.find({
      ...props,
      id: props.good.id,
      payload: {},
    });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_order_good_issues,
      payload: summarize.select(),
      transform: summarize.transform,
    })({
      where: {
        AND: [
          { hub_order_good_id: props.good.id },
          ...search(props.input.search),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ base: { created_at: "desc" } }],
    } satisfies Prisma.hub_order_good_issuesFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    id: string;
  }): Promise<IHubOrderGoodIssue> => {
    const record = await find({
      ...props,
      payload: json.select(),
    });
    return json.transform(record);
  };

  export const find = async <
    Payload extends Prisma.hub_order_good_issuesFindFirstOrThrowArgs,
  >(props: {
    payload: Payload;
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    id: string;
  }) => {
    const record =
      await HubGlobal.prisma.hub_order_good_issues.findFirstOrThrow({
        where: {
          id: props.id,
          good: {
            id: props.good.id,
            hub_seller_id:
              props.actor.type === "seller" ? props.actor.id : undefined,
            order: {
              id: props.order.id,
              customer:
                props.actor.type === "customer"
                  ? HubCustomerProvider.where(props.actor)
                  : undefined,
            },
          },
        },
        ...props.payload,
      });
    return record as Prisma.hub_order_good_issuesGetPayload<Payload>;
  };

  const search = (input: IHubOrderGoodIssue.IRequest.ISearch | undefined) =>
    [
      ...BbsArticleProvider.search(input).map((base) => ({ base })),
    ] satisfies Prisma.hub_order_good_issuesWhereInput["AND"];

  const orderBy = (
    key: IHubOrderGoodIssue.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "fee_amount"
      ? { aggregate: { accept_amount: value } }
      : key === "fee_count"
        ? { aggregate: { accept_count: value } }
        : key === "nickname"
          ? {
              customer: {
                member: {
                  nickname: value,
                },
              },
            }
          : {
              base: BbsArticleProvider.orderBy(key, value),
            }) satisfies Prisma.hub_order_good_issuesOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    input: IHubOrderGoodIssue.ICreate;
  }): Promise<IHubOrderGoodIssue> => {
    await HubGlobal.prisma.hub_order_goods.findFirstOrThrow({
      where: {
        id: props.good.id,
        order: {
          id: props.order.id,
          customer:
            props.actor.type === "customer"
              ? HubCustomerProvider.where(props.actor)
              : undefined,
        },
        hub_seller_id:
          props.actor.type === "seller" ? props.actor.id : undefined,
      },
    });

    const issue = await HubGlobal.prisma.hub_order_good_issues.create({
      data: collect(props),
      ...json.select(),
    });
    return json.transform(issue);
  };

  export const update = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    id: string;
    input: IHubOrderGoodIssue.IUpdate;
  }): Promise<IHubOrderGoodIssue.ISnapshot> => {
    const issue = await at(props);
    if (false === HubActorProvider.equals(issue.writer)(props.actor))
      throw ErrorProvider.forbidden({
        accessor: "id",
        code: HubOrderGoodIssueErrorCode.ISSUE_NOT_YOURS,
        message: `This issue is not yours.`,
      });
    return BbsArticleSnapshotProvider.create({ id: props.id })(props.input);
  };

  export const erase = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    id: string;
  }): Promise<void> => {
    const issue = await at(props);
    if (issue.fees.length)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubOrderGoodIssueErrorCode.ISSUE_FEE_ALREADY_PUBLISHED,
        message: "Unable to erase issue due to fee charged",
      });
    else if (false === HubActorProvider.equals(issue.writer)(props.actor))
      throw ErrorProvider.forbidden({
        accessor: "id",
        code: HubOrderGoodIssueErrorCode.ISSUE_NOT_YOURS,
        message: `This issue is not yours.`,
      });
    await BbsArticleProvider.erase(props.id);
  };

  const collect = (props: {
    actor: IHubActorEntity;
    good: IEntity;
    input: IHubOrderGoodIssue.ICreate;
  }) => {
    if (props.actor.member === null) {
      throw ErrorProvider.badRequest({
        accessor: "customer",
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You are not a member.",
      });
    }

    return {
      good: {
        connect: { id: props.good.id },
      },
      customer: {
        connect: {
          id:
            props.actor.type === "customer"
              ? props.actor.id
              : props.actor.customer.id,
        },
      },
      member: {
        connect: {
          id: props.actor.member.id,
        },
      },
      actor_type: props.actor.type,
      base: {
        create: BbsArticleProvider.collect(
          "order.good.issue",
          BbsArticleSnapshotProvider.collect,
        )(props.input),
      },
      aggregate: {
        create: {
          request_count: 0,
          request_amount: 0,
          accept_count: 0,
          accept_amount: 0,
        },
      },
    } satisfies Prisma.hub_order_good_issuesCreateInput;
  };
}
