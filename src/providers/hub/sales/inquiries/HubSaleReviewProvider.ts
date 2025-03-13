import { Prisma } from "@prisma/client";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubSaleAuditErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleAuditErrorCode";
import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSaleReview } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleReview";

import { HubGlobal } from "../../../../HubGlobal";
import { PaginationUtil } from "../../../../utils/PaginationUtil";
import { BbsArticleProvider } from "../../../common/BbsArticleProvider";
import { BbsArticleSnapshotProvider } from "../../../common/BbsArticleSnapshotProvider";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubCustomerProvider } from "../../actors/HubCustomerProvider";
import { HubSellerProvider } from "../../actors/HubSellerProvider";
import { HubSaleInquiryAnswerProvider } from "./HubSaleInquiryAnswerProvider";
import { HubSaleInquiryProvider } from "./HubSaleInquiryProvider";
import { HubSaleReviewSnapshotProvider } from "./HubSaleReviewSnapshotProvider";

export namespace HubSaleReviewProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace summarize {
    export const transform = (
      input: Prisma.hub_sale_snapshot_reviewsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleReview.ISummary => ({
      id: input.base.base.id,
      type: "review",
      customer: HubCustomerProvider.json.transform(input.base.customer),
      title: input.base.base.mv_last!.snapshot.title,
      score: input.base.base.mv_last!.snapshot.of_review!.score,
      created_at: input.base.base.created_at.toISOString(),
      updated_at: input.base.base.mv_last!.snapshot.created_at.toISOString(),
      read_by_seller: input.base.read_by_seller_at !== null,
      answer:
        input.base.answer !== null
          ? HubSaleInquiryAnswerProvider.summarize.transform(input.base.answer)
          : null,
    });
    export const select = () =>
      ({
        include: {
          base: {
            include: {
              base: {
                include: {
                  mv_last: {
                    include: {
                      snapshot: {
                        include: {
                          ...BbsArticleSnapshotProvider.json.select().include,
                          of_review: true,
                        },
                      },
                    },
                  },
                },
              },
              customer: HubCustomerProvider.json.select(),
              answer: HubSaleInquiryAnswerProvider.summarize.select(),
            },
          },
        },
      }) satisfies Prisma.hub_sale_snapshot_reviewsFindManyArgs;
  }

  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_snapshot_reviewsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleReview => {
      const base = BbsArticleProvider.json.transform(input.base.base);
      return {
        ...base,
        snapshots: input.base.base.snapshots
          .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
          .map((snapshot) => {
            const rs = snapshot.of_review;
            if (rs === null)
              throw ErrorProvider.internal({
                code: CommonErrorCode.INTERNAL_PRISMA_ERROR,
                message: "Unable to get the score value.",
              });
            return {
              ...BbsArticleSnapshotProvider.json.transform(snapshot),
              score: rs.score,
            };
          }),
        customer: HubCustomerProvider.json.transform(input.base.customer),
        answer:
          input.base.answer !== null
            ? HubSaleInquiryAnswerProvider.json.transform(input.base.answer)
            : null,
        read_by_seller: input.base.read_by_seller_at !== null,
        type: "review",
        liked_at:
          input.base.like.length === null
            ? null
            : (input.base.like[0]?.created_at.toISOString() ?? null),
        like_count: input.base.like.length,
      };
    };
    export const select = (actor: IHubActorEntity) =>
      ({
        include: {
          base: {
            include: {
              base: {
                include: {
                  snapshots: HubSaleReviewSnapshotProvider.json.select(),
                },
              },
              customer: HubCustomerProvider.json.select(),
              answer: HubSaleInquiryAnswerProvider.json.select(),
              like:
                actor === null
                  ? undefined
                  : {
                      where: {
                        member:
                          actor.type === "customer"
                            ? undefined
                            : {
                                id: actor.member.id,
                              },
                      },
                    },
            },
          },
        },
      }) satisfies Prisma.hub_sale_snapshot_reviewsFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    input: IHubSaleReview.IRequest;
  }): Promise<IPage<IHubSaleReview.ISummary>> => {
    if (props.actor.type === "seller")
      await HubGlobal.prisma.hub_sales.findFirstOrThrow({
        where: {
          id: props.sale.id,
          ...HubSellerProvider.whereFromCustomerField(props.actor),
        },
      });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_sale_snapshot_reviews,
      payload: summarize.select(),
      transform: summarize.transform,
    })({
      where: {
        AND: [
          {
            base: {
              base: {
                deleted_at: null,
              },
              snapshot: {
                hub_sale_id: props.sale.id,
              },
            },
          },
          ...search(props.input.search),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ base: { base: { created_at: "desc" } } }],
    } satisfies Prisma.hub_sale_snapshot_reviewsFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    id: string;
  }): Promise<IHubSaleReview> => {
    if (props.actor.type === "seller")
      await HubGlobal.prisma.hub_sales.findFirstOrThrow({
        where: {
          id: props.sale.id,
          ...HubSellerProvider.whereFromCustomerField(props.actor),
        },
      });
    const record =
      await HubGlobal.prisma.hub_sale_snapshot_reviews.findFirstOrThrow({
        where: {
          id: props.id,
          base: {
            base: {
              deleted_at: null,
            },
          },
        },
        ...json.select(props.actor),
      });
    return json.transform(record);
  };

  const search = (input: IHubSaleReview.IRequest.ISearch | undefined) =>
    [
      ...HubSaleInquiryProvider.search(input).map((base) => ({ base })),
      ...(input?.minimum !== undefined
        ? [
            {
              base: {
                base: {
                  mv_last: {
                    snapshot: {
                      of_review: {
                        score: { gte: input.minimum },
                      },
                    },
                  },
                },
              },
            },
          ]
        : []),
      ...(input?.maximum !== undefined
        ? [
            {
              base: {
                base: {
                  mv_last: {
                    snapshot: {
                      of_review: {
                        score: { lte: input.maximum },
                      },
                    },
                  },
                },
              },
            },
          ]
        : []),
    ] satisfies Prisma.hub_sale_snapshot_reviewsWhereInput["AND"];

  const orderBy = (
    key: IHubSaleReview.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    (key === "score"
      ? {
          base: {
            base: {
              mv_last: {
                snapshot: {
                  of_review: {
                    score: direction,
                  },
                },
              },
            },
          },
        }
      : {
          base: HubSaleInquiryProvider.orderBy(key, direction),
        }) satisfies Prisma.hub_sale_snapshot_reviewsOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    customer: IHubCustomer;
    sale: IEntity;
    input: IHubSaleReview.ICreate;
  }): Promise<IHubSaleReview> => {
    const material =
      await HubGlobal.prisma.mv_hub_sale_last_snapshots.findFirstOrThrow({
        where: {
          hub_sale_id: props.sale.id,
        },
      });
    if (material.approved_hub_sale_snapshot_id === null)
      throw ErrorProvider.conflict({
        accessor: "saleId",
        code: HubSaleAuditErrorCode.NOT_APPROVED,
        message: "The sale has not been approved yet.",
      });

    const good = await HubGlobal.prisma.hub_order_goods.findFirstOrThrow({
      where: {
        id: props.input.good_id,
      },
      include: {
        order: {
          include: {
            customer: HubCustomerProvider.json.select(),
          },
        },
      },
    });
    if (
      false ===
      HubCustomerProvider.equals(props.customer)(
        HubCustomerProvider.json.transform(good.order.customer),
      )
    ) {
      throw ErrorProvider.forbidden({
        accessor: "input.good_id",
        code: HubSaleErrorCode.NOT_ALLOWED_REVIEW,
        message: "You are not allowed to review the good.",
      });
    }

    const record = await HubGlobal.prisma.hub_sale_snapshot_reviews.create({
      data: collect({
        customer: props.customer,
        snapshot: {
          id: material.approved_hub_sale_snapshot_id,
        },
        input: props.input,
        good,
      }),
      ...json.select(props.customer),
    });
    return json.transform(record);
  };

  export const update = async (props: {
    customer: IHubCustomer;
    sale: IEntity;
    id: string;
    input: IHubSaleReview.IUpdate;
  }): Promise<IHubSaleReview.ISnapshot> => {
    const review = await at({
      actor: props.customer,
      sale: props.sale,
      id: props.id,
    });
    if (HubCustomerProvider.equals(review.customer)(props.customer) === false)
      throw ErrorProvider.forbidden({
        accessor: "id",
        code: HubSaleErrorCode.OWNERSHIP,
        message: "This review is not yours.",
      });
    return HubSaleReviewSnapshotProvider.create({
      review,
      input: props.input,
    });
  };

  const collect = (props: {
    customer: IHubCustomer;
    snapshot: IEntity;
    good: IEntity;
    input: IHubSaleReview.ICreate;
  }) => {
    if (props.customer.member === null) {
      throw ErrorProvider.badRequest({
        accessor: "customer",
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You are not a member.",
      });
    }

    return {
      base: {
        create: {
          type: "review",
          base: {
            create: BbsArticleProvider.collect(
              "sale.review",
              HubSaleReviewSnapshotProvider.collect,
            )(props.input),
          },
          customer: {
            connect: { id: props.customer.id },
          },
          member: {
            connect: {
              id: props.customer.member.id,
            },
          },
          snapshot: {
            connect: { id: props.snapshot.id },
          },
          read_by_seller_at: null,
        },
      },
      good: {
        connect: { id: props.good.id },
      },
    } satisfies Prisma.hub_sale_snapshot_reviewsCreateInput;
  };

  export const erase = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    id: string;
  }): Promise<void> => {
    const review: IHubSaleReview = await at(props);
    if (
      props.actor.type === "customer" &&
      HubCustomerProvider.equals(review.customer)(props.actor) === false
    )
      throw ErrorProvider.forbidden({
        accessor: "id",
        code: HubSaleErrorCode.OWNERSHIP,
        message: "This review is not yours.",
      });
    await BbsArticleProvider.erase(review.id);
  };
}
