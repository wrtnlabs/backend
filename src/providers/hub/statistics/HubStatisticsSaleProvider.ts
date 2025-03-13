import { Prisma } from "@prisma/client";

import { IHubSaleAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleAggregate";

import { HubStatisticsOrderGoodProvider } from "./HubStatisticsSaleGoodProvider";
import { HubStatisticsSaleSnapshotInquiryProvider } from "./HubStatisticsSaleSnapshotInquiryProvider";
import { HubStatisticsSaleViewProvider } from "./HubStatisticsSaleViewProvider";

export namespace HubStatisticsSaleProvider {
  export namespace json {
    export const select = () =>
      ({
        include: {
          mv_view_per_days: true,
        },
      }) satisfies Prisma.hub_sale_snapshotsFindManyArgs;

    export const transform = async (
      snapshot: Prisma.hub_sale_snapshotsGetPayload<ReturnType<typeof select>>,
    ): Promise<IHubSaleAggregate> => {
      return {
        id: snapshot.hub_sale_id,
        view: await HubStatisticsSaleViewProvider.at({
          term: {
            count_unit: 1,
            time_unit: "day",
          },
          sale_id: snapshot.hub_sale_id,
        }),
        good: await HubStatisticsOrderGoodProvider.at({
          term: {
            count_unit: 1,
            time_unit: "day",
          },
          sale_id: snapshot.hub_sale_id,
        }),
        inquiry: await HubStatisticsSaleSnapshotInquiryProvider.at({
          term: {
            count_unit: 1,
            time_unit: "day",
          },
          sale_id: snapshot.hub_sale_id,
        }),
        issue: {
          opened_count: 0,
          fee: {
            payment: 0,
            approved_count: 0,
            count: 0,
          },
          count: 0,
          closed_count: 0,
        },
        bookmark: {
          bookmark_count: 0,
          total_bookmark_count: 0,
        },
        fork: {
          fork_count: 0,
          total_fork_count: 0,
        },
      };
    };
  }
}
