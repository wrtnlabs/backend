import { InternalServerErrorException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleInquiryAnswer } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiryAnswer";

import { HubGlobal } from "../../../../HubGlobal";
import { BbsArticleProvider } from "../../../common/BbsArticleProvider";
import { BbsArticleSnapshotProvider } from "../../../common/BbsArticleSnapshotProvider";
import { HubSellerProvider } from "../../actors/HubSellerProvider";

export namespace HubSaleInquiryAnswerProvider {
  /* -----------------------------------------------------------
        TRANSFORMERS
    ----------------------------------------------------------- */
  export namespace summarize {
    export const transform = (
      input: Prisma.hub_sale_snapshot_inquiry_answersGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleInquiryAnswer.ISummary => ({
      ...BbsArticleProvider.summarize.transform(input.base),
      seller: HubSellerProvider.invert.transform(
        input.customer,
        () =>
          new InternalServerErrorException(
            "The answer has not been registered by seller.",
          ),
      ),
    });
    export const select = () =>
      ({
        include: {
          base: BbsArticleProvider.summarize.select(),
          customer: HubSellerProvider.invert.select(),
        },
      }) satisfies Prisma.hub_sale_snapshot_inquiry_answersFindManyArgs;
  }

  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_snapshot_inquiry_answersGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleInquiryAnswer => {
      const seller = HubSellerProvider.invert.transform(
        input.customer,
        () =>
          new InternalServerErrorException(
            "The answer has not been registered by seller.",
          ),
      );
      return {
        ...BbsArticleProvider.json.transform(input.base),
        seller,
      };
    };
    export const select = () =>
      ({
        include: {
          base: BbsArticleProvider.json.select(),
          customer: HubSellerProvider.invert.select(),
        },
      }) satisfies Prisma.hub_sale_snapshot_inquiry_answersFindManyArgs;
  }

  /* -----------------------------------------------------------
        WRITERS
    ----------------------------------------------------------- */
  export const create = async (props: {
    seller: IHubSeller.IInvert;
    sale: IEntity;
    inquiry: IEntity;
    input: IHubSaleInquiryAnswer.ICreate;
  }): Promise<IHubSaleInquiryAnswer> => {
    await HubGlobal.prisma.hub_sale_snapshot_inquiries.findFirstOrThrow({
      where: {
        id: props.inquiry.id,
        snapshot: {
          sale: {
            id: props.sale.id,
            member: {
              seller: {
                id: props.seller.id,
              },
            },
          },
        },
      },
    });
    const record =
      await HubGlobal.prisma.hub_sale_snapshot_inquiry_answers.create({
        data: collect(props),
        ...json.select(),
      });
    return json.transform(record);
  };

  export const update = async (props: {
    seller: IHubSeller.IInvert;
    sale: IEntity;
    inquiry: IEntity;
    input: IHubSaleInquiryAnswer.IUpdate;
  }): Promise<IHubSaleInquiryAnswer.ISnapshot> => {
    await HubGlobal.prisma.hub_sale_snapshot_inquiry_answers.findFirstOrThrow({
      where: {
        inquiry: {
          id: props.inquiry.id,
          snapshot: {
            hub_sale_id: props.sale.id,
          },
        },
        customer: {
          member: {
            seller: {
              id: props.seller.id,
            },
          },
        },
      },
    });
    return BbsArticleSnapshotProvider.create(props.inquiry)(props.input);
  };

  const collect = (props: {
    seller: IHubSeller.IInvert;
    inquiry: IEntity;
    input: IHubSaleInquiryAnswer.ICreate;
  }) =>
    ({
      base: {
        create: BbsArticleProvider.collect(
          "sale.inquiry",
          BbsArticleSnapshotProvider.collect,
        )(props.input),
      },
      inquiry: {
        connect: {
          id: props.inquiry.id,
        },
      },
      customer: {
        connect: {
          id: props.seller.customer.id,
        },
      },
      member: {
        connect: {
          id: props.seller.member.id,
        },
      },
    }) satisfies Prisma.hub_sale_snapshot_inquiry_answersCreateInput;
}
