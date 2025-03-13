import { Prisma } from "@prisma/client";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubSaleAuditErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleAuditErrorCode";
import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSaleQuestion } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleQuestion";

import { HubGlobal } from "../../../../HubGlobal";
import { PaginationUtil } from "../../../../utils/PaginationUtil";
import { BbsArticleProvider } from "../../../common/BbsArticleProvider";
import { BbsArticleSnapshotProvider } from "../../../common/BbsArticleSnapshotProvider";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubCustomerProvider } from "../../actors/HubCustomerProvider";
import { HubSellerProvider } from "../../actors/HubSellerProvider";
import { HubSaleInquiryAnswerProvider } from "./HubSaleInquiryAnswerProvider";
import { HubSaleInquiryProvider } from "./HubSaleInquiryProvider";

export namespace HubSaleQuestionProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace summarize {
    export const transform =
      (customer: IHubCustomer | null) =>
      (
        input: Prisma.hub_sale_snapshot_questionsGetPayload<
          ReturnType<typeof select>
        >,
      ): IHubSaleQuestion.ISummary => {
        const writer: IHubCustomer = HubCustomerProvider.json.transform(
          input.base.customer,
        );
        const visible: boolean =
          input.secret === false ||
          customer === null ||
          HubCustomerProvider.equals(customer)(writer);
        return {
          ...BbsArticleProvider.summarize.transform(input.base.base),
          customer: visible ? writer : HubCustomerProvider.anonymous(writer),
          title: visible
            ? input.base.base.mv_last!.snapshot.title
            : "*".repeat(24),
          secret: input.secret,
          answer:
            input.base.answer !== null
              ? HubSaleInquiryAnswerProvider.summarize.transform(
                  input.base.answer,
                )
              : null,
          read_by_seller: input.base.read_by_seller_at !== null,
          type: "question",
        };
      };
    export const select = () =>
      ({
        include: {
          base: {
            include: {
              base: BbsArticleProvider.summarize.select(),
              customer: HubCustomerProvider.json.select(),
              answer: HubSaleInquiryAnswerProvider.summarize.select(),
            },
          },
        },
      }) satisfies Prisma.hub_sale_snapshot_questionsFindManyArgs;
  }

  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_snapshot_questionsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleQuestion => ({
      ...BbsArticleProvider.json.transform(input.base.base),
      customer: HubCustomerProvider.json.transform(input.base.customer),
      answer:
        input.base.answer !== null
          ? HubSaleInquiryAnswerProvider.json.transform(input.base.answer)
          : null,
      secret: input.secret,
      read_by_seller: input.base.read_by_seller_at !== null,
      type: "question",
      liked_at:
        input.base.like.length === null
          ? null
          : (input.base.like[0]?.created_at.toISOString() ?? null),
      like_count: input.base.like.length,
    });

    export const select = (actor: IHubActorEntity) =>
      ({
        include: {
          base: {
            include: {
              base: BbsArticleProvider.json.select(),
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
      }) satisfies Prisma.hub_sale_snapshot_questionsFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    input: IHubSaleQuestion.IRequest;
  }): Promise<IPage<IHubSaleQuestion.ISummary>> => {
    if (props.actor.type === "seller")
      await HubGlobal.prisma.hub_sales.findFirstOrThrow({
        where: {
          id: props.sale.id,
          ...HubSellerProvider.whereFromCustomerField(props.actor),
        },
      });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_sale_snapshot_questions,
      payload: summarize.select(),
      transform: summarize.transform(
        props.actor.type === "customer" ? props.actor : null,
      ),
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
    } satisfies Prisma.hub_sale_snapshot_questionsFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    id: string;
  }): Promise<IHubSaleQuestion> => {
    if (props.actor.type === "seller")
      await HubGlobal.prisma.hub_sales.findFirstOrThrow({
        where: {
          id: props.sale.id,
          ...HubSellerProvider.whereFromCustomerField(props.actor),
        },
      });
    const record =
      await HubGlobal.prisma.hub_sale_snapshot_questions.findFirstOrThrow({
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
    const output: IHubSaleQuestion = json.transform(record);
    if (
      output.secret === true &&
      props.actor.type === "customer" &&
      HubCustomerProvider.equals(output.customer)(props.actor) === false
    )
      throw ErrorProvider.forbidden({
        code: HubSaleErrorCode.OWNERSHIP,
        message: "You are not allowed to access this secret question.",
      });
    return output;
  };

  const search = (input: IHubSaleQuestion.IRequest.ISearch | undefined) =>
    HubSaleInquiryProvider.search(input).map((base) => ({
      base,
    })) satisfies Prisma.hub_sale_snapshot_questionsWhereInput["AND"];

  const orderBy = (
    key: IHubSaleQuestion.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    ({
      base: HubSaleInquiryProvider.orderBy(key, direction),
    }) satisfies Prisma.hub_sale_snapshot_questionsOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    customer: IHubCustomer;
    sale: IEntity;
    input: IHubSaleQuestion.ICreate;
  }): Promise<IHubSaleQuestion> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You are not a member.",
      });
    }

    const material =
      await HubGlobal.prisma.mv_hub_sale_last_snapshots.findFirstOrThrow({
        where: {
          hub_sale_id: props.sale.id,
        },
      });
    if (material.approved_hub_sale_snapshot_id === null)
      throw ErrorProvider.conflict({
        accessor: "id",
        code: HubSaleAuditErrorCode.NOT_APPROVED,
        message: "The sale has not been approved yet.",
      });

    const record = await HubGlobal.prisma.hub_sale_snapshot_questions.create({
      data: collect({
        customer: props.customer,
        snapshot: { id: material.approved_hub_sale_snapshot_id! },
        input: props.input,
      }),
      ...json.select(props.customer),
    });
    return json.transform(record);
  };

  export const update = async (props: {
    customer: IHubCustomer;
    sale: IEntity;
    id: string;
    input: IHubSaleQuestion.IUpdate;
  }): Promise<IHubSaleQuestion.ISnapshot> => {
    const question: IHubSaleQuestion = await at({
      actor: props.customer,
      sale: props.sale,
      id: props.id,
    });
    if (false === HubCustomerProvider.equals(props.customer)(question.customer))
      throw ErrorProvider.forbidden({
        accessor: "id",
        code: HubSaleErrorCode.OWNERSHIP,
        message: "This question is not yours.",
      });
    return BbsArticleSnapshotProvider.create(question)(props.input);
  };

  const collect = (props: {
    customer: IHubCustomer;
    snapshot: IEntity;
    input: IHubSaleQuestion.ICreate;
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
          type: "question",
          base: {
            create: BbsArticleProvider.collect(
              "sale.question",
              BbsArticleSnapshotProvider.collect,
            )(props.input),
          },
          member: {
            connect: {
              id: props.customer.member.id,
            },
          },
          customer: {
            connect: { id: props.customer.id },
          },
          snapshot: {
            connect: { id: props.snapshot.id },
          },
          read_by_seller_at: null,
        },
      },
      secret: props.input.secret,
    } satisfies Prisma.hub_sale_snapshot_questionsCreateInput;
  };

  export const erase = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    id: string;
  }) => {
    const question: IHubSaleQuestion = await at(props);
    if (props.actor.type === "customer") {
      if (
        props.actor.type === "customer" &&
        HubCustomerProvider.equals(question.customer)(props.actor) === false
      )
        throw ErrorProvider.forbidden({
          code: HubSaleErrorCode.OWNERSHIP,
          message: "This question is not yours.",
        });
    }
    await BbsArticleProvider.erase(question.id);
  };
}
