import { Prisma } from "@prisma/client";

import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IHubSaleAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleAggregate";
import { IHubSaleGoodAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleGoodAggregate";

import { HubGlobal } from "../../../HubGlobal";
import { ErrorProvider } from "../../common/ErrorProvider";

export namespace HubStatisticsOrderGoodProvider {
  export namespace json {
    export const select = () =>
      ({
        include: {
          goods: true,
        },
      }) satisfies Prisma.v_date_daysFindManyArgs;

    export const transform =
      (time: boolean) =>
      (
        input: Prisma.v_date_daysGetPayload<ReturnType<typeof select>>,
      ): IHubSaleGoodAggregate => ({
        date: time
          ? input.date.toISOString()
          : input.date.toISOString().substring(0, 10),
        ...pivot(input.goods),
      });
  }

  export const at = async (
    input: IHubSaleAggregate.IRequest.ISearch,
  ): Promise<IHubSaleGoodAggregate> => {
    if (input.sale_id === undefined) {
      throw ErrorProvider.badRequest({
        accessor: "input.search.sale_id",
        code: HubSaleErrorCode.SALE_NOT_FOUND,
        message: "cannot be used with input.search.sale_id",
      });
    }

    const records =
      await HubGlobal.prisma.mv_hub_sale_order_good_aggregate_per_days.findMany(
        {
          where: {
            good: {
              commodity: {
                snapshot: {
                  sale: {
                    id: input.sale_id,
                  },
                },
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
  group: Prisma.mv_hub_sale_order_good_aggregate_per_daysGetPayload<object>[],
): Omit<IHubSaleGoodAggregate, "date"> => {
  const status_2xx = group
    .map((record) => record.status_2xx)
    .reduce(reducer, 0);
  const status_3xx = group
    .map((record) => record.status_3xx)
    .reduce(reducer, 0);
  const status_4xx = group
    .map((record) => record.status_4xx)
    .reduce(reducer, 0);
  const status_5xx = group
    .map((record) => record.status_5xx)
    .reduce(reducer, 0);
  const success = group
    .map((record) => record.success_count)
    .reduce(reducer, 0);
  const none = group.map((record) => record.none).reduce(reducer, 0);

  const failedCount = status_2xx + status_3xx + status_4xx + status_5xx + none;

  const totalCount =
    success + status_2xx + status_3xx + status_4xx + status_5xx + none;

  return {
    latency: 0,
    knock_count: 0,
    publish_count: group
      .map((record) => record.publish_count)
      .reduce(reducer, 0),
    failed_count: failedCount,
    success_count: success,
    total_call_count: totalCount,
    fixed: 0,
    variable: 0,
  };
};
const reducer = (a: number, b: number) => a + b;
