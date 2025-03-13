import { Prisma } from "@prisma/client";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubSaleReview } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleReview";

import { HubGlobal } from "../../../../HubGlobal";
import { BbsArticleSnapshotProvider } from "../../../common/BbsArticleSnapshotProvider";
import { ErrorProvider } from "../../../common/ErrorProvider";

export namespace HubSaleReviewSnapshotProvider {
  export namespace json {
    export const transform = (
      input: Prisma.bbs_article_snapshotsGetPayload<ReturnType<typeof select>>,
    ): IHubSaleReview.ISnapshot => {
      const rs = input.of_review;
      if (rs === null)
        throw ErrorProvider.internal({
          code: CommonErrorCode.INTERNAL_PRISMA_ERROR,
          message: "Unable to get the score value.",
        });
      return {
        ...BbsArticleSnapshotProvider.json.transform(input),
        score: rs.score,
      };
    };
    export const select = () =>
      ({
        include: {
          ...BbsArticleSnapshotProvider.json.select().include,
          of_review: true,
        },
      }) satisfies Prisma.bbs_article_snapshotsFindManyArgs;
  }

  export const create = async (props: {
    review: IEntity;
    input: IHubSaleReview.IUpdate;
  }): Promise<IHubSaleReview.ISnapshot> => {
    const record = await HubGlobal.prisma.bbs_article_snapshots.create({
      data: {
        ...collect(props.input),
        article: { connect: { id: props.review.id } },
      },
      ...json.select(),
    });
    return json.transform(record);
  };

  export const collect = (input: IHubSaleReview.IUpdate) =>
    ({
      ...BbsArticleSnapshotProvider.collect(input),
      of_review: {
        create: {
          score: input.score,
        },
      },
    }) satisfies Prisma.bbs_article_snapshotsCreateWithoutArticleInput;
}
