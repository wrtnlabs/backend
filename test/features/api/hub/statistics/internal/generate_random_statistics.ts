// import { ArrayUtil, RandomGenerator } from "@nestia/e2e";
// import { randint } from "tstl";
// import typia from "typia";
//
// import HubApi from "@wrtnlabs/os-api";
// import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
// import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
// import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
// import { IHubSaleGoodChart } from "@wrtnlabs/os-api/lib/structures/hub/statistics/IHubSaleGoodChart";
// import { IHubSaleAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleAggregate";
//
// import { ConnectionPool } from "../../../../../ConnectionPool";
// import { generate_random_cart_commodity } from "../../carts/internal/generate_random_cart_commodity";
// import { generate_random_sale } from "../../sales/internal/generate_random_sale";
//
// export const generate_random_statistics = async (
//   pool: ConnectionPool,
// ): Promise<IHubSaleAggregate> => {
//   const sale: IHubSale = await generate_random_sale(pool, "approved");
//
//   const commodity: IHubCartCommodity = await generate_random_cart_commodity(
//     pool,
//     sale,
//   );
//   const order: IHubOrder = await HubApi.functional.hub.customers.orders.create(
//     pool.customer,
//     {
//       goods: [
//         {
//           commodity_id: commodity.id,
//         },
//       ],
//       published_at: null,
//       expired_at: null,
//     },
//   );
//   typia.assertEquals(order);
//
//   const charts: IHubSaleGoodChart[] = await ArrayUtil.asyncRepeat(25)(
//     async () => {
//       const chart: IHubSaleGoodChart = {
//         hourly_call_axis: RANDOM_INT,
//         date_axis: RandomGenerator.date(new Date())(
//           randint(0, 7 * DAY),
//         ).toISOString(),
//       };
//       return typia.assertEquals(chart);
//     },
//   );
//
//   const interval = await ArrayUtil.asyncRepeat(11)(async () => {
//     return {
//       score: 0,
//       count: 1,
//     };
//   });
//
//   const statistics = await HubApi.functional.hub.sellers.statistics.goods.create(
//     pool.seller,
//     {
//       id: order.id,
//       sale_name: RandomGenerator.name(),
//       good: {
//         good_name: RandomGenerator.name(),
//         latency: RANDOM_LATENCY,
//         knock_count: RANDOM_INT,
//         publish_count: RANDOM_INT,
//         failed_count: RANDOM_INT,
//         success_count: RANDOM_INT,
//         total_call_count: RANDOM_INT,
//         charts: charts,
//         error_charts: charts,
//         fixed: 0, // TODO
//         variable: 0, // TODO
//       },
//       inquiry: {
//         question: {
//           hit: RANDOM_INT,
//           count: RANDOM_INT,
//           answer_count: RANDOM_INT,
//         },
//         review: {
//           hit: RANDOM_INT,
//           count: RANDOM_INT,
//           answer_count: RANDOM_INT,
//           statistics: null,
//           intervals: interval,
//         },
//       },
//       issue: {
//         count: RANDOM_INT,
//         closed_count: RANDOM_INT,
//         opened_count: RANDOM_INT,
//         fee: {
//           count: RANDOM_INT,
//           approved_count: RANDOM_INT,
//           payment: 0,
//         },
//       },
//       hit: RANDOM_INT,
//     },
//   );
//   typia.assertEquals(statistics);
//
//   return statistics;
// };
// const RANDOM_INT = Math.floor(Math.random() * 10000);
// const RANDOM_LATENCY =
//   Math.floor(Math.random() * 100) / 100 + Math.floor(Math.random() * 901) + 100;
// const DAY = 24 * 60 * 60 * 1000;
