import { Prisma } from "@prisma/client";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubOrderGoodIssueErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderGoodIssueErrorCode";
import { HubSellerDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/actors/HubSellerDiagnoser";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubOrderGoodIssueComment } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueComment";

import { HubGlobal } from "../../../../HubGlobal";
import { PaginationUtil } from "../../../../utils/PaginationUtil";
import { BbsArticleCommentProvider } from "../../../common/BbsArticleCommentProvider";
import { BbsArticleCommentSnapshotProvider } from "../../../common/BbsArticleCommentSnapshotProvider";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubActorProvider } from "../../actors/HubActorProvider";
import { HubCustomerProvider } from "../../actors/HubCustomerProvider";
import { HubOrderGoodIssueProvider } from "./HubOrderGoodIssueProvider";

export namespace HubOrderGoodIssueCommentProvider {
  /* -----------------------------------------------------------
        TRANSFORMERS
    ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_order_good_issue_commentsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubOrderGoodIssueComment => {
      const customer = HubCustomerProvider.json.transform(input.customer);
      const writer =
        input.actor_type === "customer"
          ? customer
          : HubSellerDiagnoser.invert(customer);
      if (writer === null)
        throw ErrorProvider.internal({
          code: CommonErrorCode.INTERNAL_SERVER_ERROR,
          message: `The comment has not been registered by ${input.actor_type}.`,
        });
      return {
        ...BbsArticleCommentProvider.json.transform(input.base),
        writer,
      };
    };
    export const select = () =>
      ({
        include: {
          base: BbsArticleCommentProvider.json.select(),
          customer: HubCustomerProvider.json.select(),
        },
      }) satisfies Prisma.hub_order_good_issue_commentsFindManyArgs;
  }

  /* -----------------------------------------------------------
        READERS
    ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    issue: IEntity;
    input: IHubOrderGoodIssueComment.IRequest;
  }): Promise<IPage<IHubOrderGoodIssueComment>> => {
    await HubOrderGoodIssueProvider.find({
      ...props,
      id: props.issue.id,
      payload: {},
    });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_order_good_issue_comments,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        AND: [
          {
            base: {
              bbs_article_id: props.issue.id,
            },
          },
          ...BbsArticleCommentProvider.search(props.input.search).map(
            (base) => ({
              base,
            }),
          ),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(BbsArticleCommentProvider.orderBy)(
            props.input.sort,
          ).map((base) => ({ base }))
        : [{ base: { created_at: "asc" } }],
    } satisfies Prisma.hub_order_good_issue_commentsFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    issue: IEntity;
    id: string;
  }): Promise<IHubOrderGoodIssueComment> => {
    await HubOrderGoodIssueProvider.find({
      ...props,
      id: props.issue.id,
      payload: {},
    });
    const record =
      await HubGlobal.prisma.hub_order_good_issue_comments.findFirstOrThrow({
        where: {
          id: props.id,
          base: {
            bbs_article_id: props.issue.id,
          },
        },
        ...json.select(),
      });
    return json.transform(record);
  };

  /* -----------------------------------------------------------
        WRITERS
    ----------------------------------------------------------- */
  export const create = async (props: {
    actor: IHubCustomer | IHubSeller.IInvert;
    order: IEntity;
    good: IEntity;
    issue: IEntity;
    input: IHubOrderGoodIssueComment.ICreate;
  }): Promise<IHubOrderGoodIssueComment> => {
    await HubOrderGoodIssueProvider.find({
      actor: props.actor,
      order: props.order,
      good: props.good,
      id: props.issue.id,
      payload: {},
    });
    const record = await HubGlobal.prisma.hub_order_good_issue_comments.create({
      data: collect(props),
      ...json.select(),
    });
    return json.transform(record);
  };

  export const update = async (props: {
    actor: IHubCustomer | IHubSeller.IInvert;
    order: IEntity;
    good: IEntity;
    issue: IEntity;
    id: string;
    input: IHubOrderGoodIssueComment.IUpdate;
  }): Promise<IHubOrderGoodIssueComment.ISnapshot> => {
    const comment = await at(props);
    if (false === HubActorProvider.equals(comment.writer)(props.actor))
      throw ErrorProvider.forbidden({
        accessor: "id",
        code: HubOrderGoodIssueErrorCode.ISSUE_COMMENT_NOT_YOURS,
        message: "This comment is not yours.",
      });
    return BbsArticleCommentSnapshotProvider.create(comment)(props.input);
  };

  export const erase = async (props: {
    actor: IHubCustomer | IHubSeller.IInvert;
    order: IEntity;
    good: IEntity;
    issue: IEntity;
    id: string;
  }): Promise<void> => {
    const comment = await at(props);
    if (false === HubActorProvider.equals(comment.writer)(props.actor))
      throw ErrorProvider.forbidden({
        accessor: "id",
        code: HubOrderGoodIssueErrorCode.ISSUE_COMMENT_NOT_YOURS,
        message: "This comment is not yours.",
      });
    await BbsArticleCommentProvider.erase(props.id);
  };

  const collect = (props: {
    actor: IHubCustomer | IHubSeller.IInvert;
    issue: IEntity;
    input: IHubOrderGoodIssueComment.ICreate;
  }) => {
    if (props.actor.member === null) {
      throw ErrorProvider.badRequest({
        accessor: "customer",
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You are not a member.",
      });
    }

    return {
      base: {
        create: BbsArticleCommentProvider.collect(
          "order.good.issue",
          BbsArticleCommentSnapshotProvider.collect,
        )(props.issue)(props.input),
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
    } satisfies Prisma.hub_order_good_issue_commentsCreateInput;
  };
}
