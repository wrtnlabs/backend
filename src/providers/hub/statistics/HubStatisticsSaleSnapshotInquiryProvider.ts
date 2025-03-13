import { Prisma } from "@prisma/client";

import { IHubSaleAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleAggregate";
import { IHubSaleInquiryAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleInquiryAggregate";

import { HubGlobal } from "../../../HubGlobal";

export namespace HubStatisticsSaleSnapshotInquiryProvider {
  export namespace json {
    export const select = () =>
      ({
        include: {
          inquiries: true,
        },
      }) satisfies Prisma.v_date_daysFindManyArgs;

    export const transform = (
      input: Prisma.v_date_daysGetPayload<ReturnType<typeof select>>,
    ): IHubSaleInquiryAggregate => ({
      ...pivot(input.inquiries),
    });
  }

  export const at = async (
    input: IHubSaleAggregate.IRequest.ISearch,
  ): Promise<IHubSaleInquiryAggregate> => {
    const records =
      await HubGlobal.prisma.mv_hub_sale_snapshot_inquiry_aggregate_per_days.findMany(
        {
          where: {
            snapshots: {
              sale: {
                id: input.sale_id,
              },
            },
          },
        },
      );

    return {
      ...pivot(records),
    };
  };

  const pivot = (
    group: Prisma.mv_hub_sale_snapshot_inquiry_aggregate_per_daysGetPayload<object>[],
  ): Omit<IHubSaleInquiryAggregate, "date"> => {
    const exists = group.filter(
      (record) => record.average !== null && record.average !== 0,
    );

    const question_count = group.reduce(
      (acc, record) => acc + record.question_count,
      0,
    );
    const review_count = group.reduce(
      (acc, record) => acc + record.review_count,
      0,
    );

    return {
      review: {
        count: review_count,
        answer_count: 0,
        statistics:
          exists.length === 0
            ? null
            : {
                average:
                  exists.reduce((acc, record) => acc + record.average!, 0) /
                  exists.length,
                stdev: 0,
              },
        hit: 0,
        intervals: [],
      },
      question: {
        hit: 0,
        answer_count: 0,
        count: question_count,
      },
    };
  };
}
