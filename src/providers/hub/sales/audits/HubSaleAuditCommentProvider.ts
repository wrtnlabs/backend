import { Prisma } from "@prisma/client";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubOrderGoodIssueErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderGoodIssueErrorCode";
import { HubAdministratorDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/actors/HubAdministratorDiagnoser";
import { HubSellerDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/actors/HubSellerDiagnoser";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleAuditComment } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditComment";

import { HubGlobal } from "../../../../HubGlobal";
import { PaginationUtil } from "../../../../utils/PaginationUtil";
import { BbsArticleCommentProvider } from "../../../common/BbsArticleCommentProvider";
import { BbsArticleCommentSnapshotProvider } from "../../../common/BbsArticleCommentSnapshotProvider";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubActorProvider } from "../../actors/HubActorProvider";
import { HubCustomerProvider } from "../../actors/HubCustomerProvider";
import { HubSaleAuditProvider } from "./HubSaleAuditProvider";

export namespace HubSaleAuditCommentProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_audit_commentsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleAuditComment => {
      const customer = HubCustomerProvider.json.transform(input.customer);
      const writer =
        input.actor_type === "administrator"
          ? HubAdministratorDiagnoser.invert(customer)
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
      }) satisfies Prisma.hub_sale_audit_commentsFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubSeller.IInvert | IHubAdministrator.IInvert;
    sale: IEntity;
    audit: IEntity;
    input: IHubSaleAuditComment.IRequest;
  }): Promise<IPage<IHubSaleAuditComment>> => {
    await HubSaleAuditProvider.find({
      ...props,
      id: props.audit.id,
      payload: {},
    });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_sale_audit_comments,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        AND: [
          {
            base: {
              bbs_article_id: props.audit.id,
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
    } satisfies Prisma.hub_sale_audit_commentsFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubSeller.IInvert | IHubAdministrator.IInvert;
    sale: IEntity;
    audit: IEntity;
    id: string;
  }): Promise<IHubSaleAuditComment> => {
    await HubSaleAuditProvider.find({
      ...props,
      id: props.audit.id,
      payload: {},
    });
    const record =
      await HubGlobal.prisma.hub_sale_audit_comments.findFirstOrThrow({
        where: {
          id: props.id,
          base: {
            bbs_article_id: props.audit.id,
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
    actor: IHubSeller.IInvert | IHubAdministrator.IInvert;
    sale: IEntity;
    audit: IEntity;
    input: IHubSaleAuditComment.ICreate;
  }): Promise<IHubSaleAuditComment> => {
    await HubSaleAuditProvider.find({
      ...props,
      id: props.audit.id,
      payload: {},
    });
    const record = await HubGlobal.prisma.hub_sale_audit_comments.create({
      data: collect(props),
      ...json.select(),
    });
    return json.transform(record);
  };

  export const update = async (props: {
    actor: IHubSeller.IInvert | IHubAdministrator.IInvert;
    sale: IEntity;
    audit: IEntity;
    id: string;
    input: IHubSaleAuditComment.IUpdate;
  }): Promise<IHubSaleAuditComment.ISnapshot> => {
    const comment = await at(props);
    if (false === HubActorProvider.equals(comment.writer)(props.actor))
      throw ErrorProvider.forbidden({
        accessor: "id",
        code: HubOrderGoodIssueErrorCode.ISSUE_COMMENT_NOT_YOURS,
        message: "This comment is not yours.",
      });
    return BbsArticleCommentSnapshotProvider.create(comment)(props.input);
  };

  const collect = (props: {
    actor: IHubSeller.IInvert | IHubAdministrator.IInvert;
    audit: IEntity;
    input: IHubSaleAuditComment.ICreate;
  }) =>
    ({
      base: {
        create: BbsArticleCommentProvider.collect(
          "sale.audit",
          BbsArticleCommentSnapshotProvider.collect,
        )(props.audit)(props.input),
      },
      customer: {
        connect: { id: props.actor.customer.id },
      },
      member: {
        connect: {
          id: props.actor.member.id,
        },
      },
      actor_type: props.actor.type,
    }) satisfies Prisma.hub_sale_audit_commentsCreateInput;
}
