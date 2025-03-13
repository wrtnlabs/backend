import { Prisma } from "@prisma/client";

import { HubOrderErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderErrorCode";
import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubOrderGoodCallAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/activity/IHubOrderGoodCallAggregate";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";

export namespace HubStatisticsOrderGoodCallProvider {
  export namespace json {
    export const select = () =>
      ({
        include: {
          calls: true,
        },
      }) satisfies Prisma.v_date_daysFindManyArgs;

    export const transform = (
      input: Prisma.v_date_daysGetPayload<ReturnType<typeof select>>,
      time: boolean,
    ): IHubOrderGoodCallAggregate => ({
      date: time
        ? input.date.toISOString()
        : input.date.toISOString().substring(0, 10),
      ...pivot(input.calls),
    });
  }

  export const index = async (props: {
    actor: IHubActorEntity;
    input: IHubOrderGoodCallAggregate.IRequest;
  }): Promise<IPage<IHubOrderGoodCallAggregate>> => {
    // VALIDATE SEARCH DATA
    if (
      props.input.search?.good_ids?.length &&
      props.input.search?.sale_ids?.length
    )
      throw ErrorProvider.badRequest([
        {
          accessor: "input.search.good_ids",
          code: HubSaleErrorCode.SALE_NOT_FOUND,
          message: "cannot be used with input.search.sale_ids",
        },
        {
          accessor: "input.search.sale_ids",
          code: HubOrderErrorCode.NOT_FOUND,
          message: "cannot be used with input.search.good_ids",
        },
      ]);

    // @todo - VALIDATE OWNERSHIP
    // 검색 항목 중 상품이나 매물이 있거든, 소유 관계를 검증하는 로직을 추가할 것.
    props.actor;

    return PaginationUtil.paginate({
      schema:
        props.input.term === "hour"
          ? HubGlobal.prisma.v_date_hours
          : props.input.term === "day"
            ? HubGlobal.prisma.v_date_days
            : props.input.term === "week"
              ? HubGlobal.prisma.v_date_weeks
              : props.input.term === "month"
                ? HubGlobal.prisma.v_date_months
                : props.input.term === "quarter"
                  ? HubGlobal.prisma.v_date_quarters
                  : HubGlobal.prisma.v_date_years,
      payload: json.select(),
      transform: (v) => json.transform(v, props.input.term === "hour"),
    })({
      where: {
        AND: search({
          actor: props.actor,
          input: props.input?.search,
        }).map((condition) => ({
          calls: {
            some: condition,
          },
        })),
      },
      orderBy: [
        {
          date: "asc",
        },
      ],
    } satisfies Prisma.v_date_daysFindManyArgs)(props.input);
  };

  export const entire = async (props: {
    actor: IHubActorEntity;
    input: IHubOrderGoodCallAggregate.IEntireRequest;
  }): Promise<IHubOrderGoodCallAggregate> => {
    // VALIDATE SEARCH DATA
    if (props.input.good_ids?.length && props.input.sale_ids?.length)
      throw ErrorProvider.badRequest([
        {
          accessor: "input.search.good_ids",
          code: HubSaleErrorCode.SALE_NOT_FOUND,
          message: "cannot be used with input.search.sale_ids",
        },
        {
          accessor: "input.search.sale_ids",
          code: HubOrderErrorCode.NOT_FOUND,
          message: "cannot be used with input.search.good_ids",
        },
      ]);

    // @todo - VALIDATE OWNERSHIP
    // 검색 항목 중 상품이나 매물이 있거든, 소유 관계를 검증하는 로직을 추가할 것.
    props.actor;

    const records =
      await HubGlobal.prisma.mv_hub_order_good_call_aggregate_per_totals.findMany(
        {
          where: {
            AND: search(props),
          },
        },
      );
    return {
      date: new Date().toISOString().substring(0, 10),
      ...pivot(records),
    };
  };

  const search = (props: {
    actor: IHubActorEntity;
    input: IHubOrderGoodCallAggregate.IRequest.ISearch | undefined;
  }) =>
    [
      ...(props.input?.sale_ids?.length
        ? [
            {
              good: {
                commodity: {
                  snapshot: {
                    hub_sale_id: {
                      in: props.input.sale_ids,
                    },
                  },
                },
              },
            },
          ]
        : []),
      ...(props.input?.good_ids?.length
        ? [
            {
              hub_order_good_id: {
                in: props.input.good_ids,
              },
            },
          ]
        : []),
      ...(props.input?.from !== undefined
        ? [{ date: { gte: new Date(props.input.from) } }]
        : []),
      ...(props.input?.to !== undefined
        ? [{ date: { lt: new Date(props.input.to) } }]
        : []),
      ...(props.actor.type === "customer" &&
      !props.input?.sale_ids?.length &&
      !props.input?.good_ids?.length
        ? [
            {
              good: {
                order: {
                  customer: HubCustomerProvider.where(props.actor),
                },
              },
            },
          ]
        : []),
      ...(props.actor.type === "seller" &&
      !props.input?.sale_ids?.length &&
      !props.input?.good_ids?.length
        ? [
            {
              good: {
                commodity: {
                  snapshot: {
                    sale: {
                      member: {
                        seller: {
                          id: props.actor.id,
                        },
                      },
                    },
                  },
                },
              },
            },
          ]
        : []),
    ] satisfies Prisma.mv_hub_order_good_call_aggregate_per_daysWhereInput["AND"];
}

const pivot = (
  group: Prisma.mv_hub_order_good_call_aggregate_per_daysGetPayload<object>[],
): Omit<IHubOrderGoodCallAggregate, "date"> => {
  const exists = group.filter((record) => record.latency_mean !== null);
  const counter = (
    rec: Prisma.mv_hub_order_good_call_aggregate_per_daysGetPayload<object>,
  ) =>
    rec.success +
    rec.status_2xx +
    rec.status_3xx +
    rec.status_4xx +
    rec.status_5xx;

  return {
    success: group.map((r) => r.success).reduce(reducer, 0),
    status_2xx: group.map((r) => r.status_2xx).reduce(reducer, 0),
    status_3xx: group.map((r) => r.status_3xx).reduce(reducer, 0),
    status_4xx: group.map((r) => r.status_4xx).reduce(reducer, 0),
    status_5xx: group.map((r) => r.status_5xx).reduce(reducer, 0),
    none: group.map((r) => r.none).reduce(reducer, 0),
    latency:
      exists.length === 0
        ? null
        : {
            mean:
              exists.map((e) => e.latency_mean! * counter(e)).reduce(reducer) /
              exists.map((e) => counter(e)).reduce(reducer),
            count: exists.map((e) => counter(e)).reduce(reducer),
            stdev: 0, // @todo
          },
  };
};

const reducer = (a: number, b: number) => a + b;
