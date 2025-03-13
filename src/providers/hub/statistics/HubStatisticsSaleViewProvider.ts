import { Prisma } from "@prisma/client";

import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IHubSaleAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleAggregate";
import { IHubSaleViewCountAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/view/IHubSaleViewCountAggregate";

import { HubGlobal } from "../../../HubGlobal";
import { ErrorProvider } from "../../common/ErrorProvider";

export namespace HubStatisticsSaleViewProvider {
  export namespace json {
    export const select = () =>
      ({
        include: {
          views: true,
        },
      }) satisfies Prisma.v_date_daysFindManyArgs;

    export const transform = (
      input: Prisma.v_date_daysGetPayload<ReturnType<typeof select>>,
      time: boolean,
    ): IHubSaleViewCountAggregate => ({
      date: time
        ? input.date.toISOString()
        : input.date.toISOString().substring(0, 10),
      ...pivot(input.views),
    });
  }

  export const at = async (
    input: IHubSaleAggregate.IRequest.ISearch,
  ): Promise<IHubSaleViewCountAggregate> => {
    if (input.sale_id === undefined) {
      throw ErrorProvider.badRequest({
        accessor: "input.search.sale_id",
        code: HubSaleErrorCode.SALE_NOT_FOUND,
        message: "cannot be used with input.search.sale_id",
      });
    }

    const records =
      await HubGlobal.prisma.mv_hub_sale_snapshot_view_aggregate_per_days.findMany(
        {
          where: {
            snapshot: {
              sale: {
                id: input.sale_id,
              },
            },
          },
        },
      );

    return {
      date: new Date().toISOString().substring(0, 10),
      ...pivot(records),
    };
  };
}

const pivot = (
  group: Prisma.mv_hub_sale_snapshot_view_aggregate_per_daysGetPayload<object>[],
): Omit<IHubSaleViewCountAggregate, "date"> => {
  const total_view_count = group.map((r) => r.count).reduce(reducer, 0);
  const viewer_count = group.map((r) => r.viewer_count).reduce(reducer, 0);

  return {
    view_count: 0,
    viewer_count,
    total_view_count,
  };
};
const reducer = (a: number, b: number) => a + b;
