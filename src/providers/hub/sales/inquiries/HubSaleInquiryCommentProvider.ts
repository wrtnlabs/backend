import { Prisma } from "@prisma/client";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubSaleInquiryErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleInquiryErrorCode";
import { HubSellerDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/actors/HubSellerDiagnoser";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleInquiryComment } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiryComment";

import { HubGlobal } from "../../../../HubGlobal";
import { PaginationUtil } from "../../../../utils/PaginationUtil";
import { BbsArticleCommentProvider } from "../../../common/BbsArticleCommentProvider";
import { BbsArticleCommentSnapshotProvider } from "../../../common/BbsArticleCommentSnapshotProvider";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubActorProvider } from "../../actors/HubActorProvider";
import { HubCustomerProvider } from "../../actors/HubCustomerProvider";
import { HubSellerProvider } from "../../actors/HubSellerProvider";

export namespace HubSaleInquiryCommentProvider {
  /* -----------------------------------------------------------
            TRANSFORMERS
        ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_snapshot_inquiry_commentsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleInquiryComment => {
      const customer = HubCustomerProvider.json.transform(input.customer);
      const writer =
        input.actor_type === "customer"
          ? customer
          : HubSellerDiagnoser.invert(customer);
      if (writer === null)
        throw ErrorProvider.internal({
          code: CommonErrorCode.INTERNAL_PRISMA_ERROR,
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
      }) satisfies Prisma.hub_sale_snapshot_inquiry_commentsFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    inquiry: IEntity;
    input: IHubSaleInquiryComment.IRequest;
  }): Promise<IPage<IHubSaleInquiryComment>> => {
    if (props.actor.type === "seller")
      await HubGlobal.prisma.hub_sales.findFirstOrThrow({
        where: {
          id: props.sale.id,
          ...HubSellerProvider.whereFromCustomerField(props.actor),
        },
      });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_sale_snapshot_inquiry_comments,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        AND: [
          {
            base: {
              deleted_at: null,
              bbs_article_id: props.inquiry.id,
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
    } satisfies Prisma.hub_sale_snapshot_inquiry_commentsFindManyArgs)(
      props.input,
    );
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    inquiry: IEntity;
    id: string;
  }): Promise<IHubSaleInquiryComment> => {
    if (props.actor.type === "seller")
      await HubGlobal.prisma.hub_sales.findFirstOrThrow({
        where: {
          id: props.sale.id,
          ...HubSellerProvider.whereFromCustomerField(props.actor),
        },
      });
    const record =
      await HubGlobal.prisma.hub_sale_snapshot_inquiry_comments.findFirstOrThrow(
        {
          where: {
            id: props.id,
            base: {
              deleted_at: null,
              article: {
                of_inquiry: {
                  id: props.inquiry.id,
                  snapshot: {
                    hub_sale_id: props.sale.id,
                  },
                },
              },
            },
          },
          ...json.select(),
        },
      );
    return json.transform(record);
  };

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    actor: IHubCustomer | IHubSeller.IInvert;
    sale: IEntity;
    inquiry: IEntity;
    input: IHubSaleInquiryComment.ICreate;
  }): Promise<IHubSaleInquiryComment> => {
    if (props.actor.member === null)
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You're not a member.",
      });

    const inquiry =
      await HubGlobal.prisma.hub_sale_snapshot_inquiries.findFirstOrThrow({
        where: {
          id: props.inquiry.id,
          snapshot: {
            sale: {
              id: props.sale.id,
              member:
                props.actor.type === "seller"
                  ? {
                      seller: {
                        id: props.actor.id,
                      },
                    }
                  : undefined,
            },
          },
        },
      });
    const record =
      await HubGlobal.prisma.hub_sale_snapshot_inquiry_comments.create({
        data: collect({
          actor: props.actor,
          input: props.input,
          inquiry,
        }),
        ...json.select(),
      });
    return json.transform(record);
  };

  export const update = async (props: {
    actor: IHubCustomer | IHubSeller.IInvert;
    sale: IEntity;
    inquiry: IEntity;
    id: string;
    input: IHubSaleInquiryComment.IUpdate;
  }): Promise<IHubSaleInquiryComment.ISnapshot> => {
    const comment = await at(props);
    if (false === HubActorProvider.equals(comment.writer)(props.actor))
      throw ErrorProvider.forbidden({
        accessor: "id",
        code: HubSaleInquiryErrorCode.OWNERSHIP,
        message: `This comment is not yours.`,
      });
    return BbsArticleCommentSnapshotProvider.create({ id: props.id })(
      props.input,
    );
  };

  const collect = (props: {
    actor: IHubCustomer | IHubSeller.IInvert;
    inquiry: IEntity;
    input: IHubSaleInquiryComment.ICreate;
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
          "sale.inquiry",
          BbsArticleCommentSnapshotProvider.collect,
        )(props.inquiry)(props.input),
      },
      actor_type: props.actor.type,
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
    } satisfies Prisma.hub_sale_snapshot_inquiry_commentsCreateInput;
  };

  export const erase = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    inquiry: IEntity;
    id: string;
  }) => {
    const comment = await at(props);
    if (false === HubActorProvider.equals(comment.writer)(props.actor))
      throw ErrorProvider.forbidden({
        accessor: "id",
        code: HubSaleInquiryErrorCode.OWNERSHIP,
        message: `This comment is not yours.`,
      });
    await BbsArticleCommentProvider.erase(comment.id);
  };
}
