// import { ArrayUtil, RandomGenerator } from "@nestia/e2e";
// import { randint } from "tstl";
// import typia from "typia";
// import { v4 } from "uuid";
//
// import HubApi from "@wrtnlabs/os-api";
// import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
// import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
// import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
// import { IHubSaleGoodChart } from "@wrtnlabs/os-api/lib/structures/hub/statistics/IHubSaleGoodChart";
// import {
//   IHubSaleGoodCustomerAggregate,
//   IRank,
// } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleGoodCustomerAggregate";
//
// import { ConnectionPool } from "../../../../../ConnectionPool";
// import { generate_random_cart_commodity } from "../../carts/internal/generate_random_cart_commodity";
// import { generate_random_sale } from "../../sales/internal/generate_random_sale";
//
// export const generate_random_customer_statistics = async (
//   pool: ConnectionPool,
// ): Promise<IHubSaleGoodCustomerAggregate> => {
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
//   const charts: IHubSaleGoodChart[] = await ArrayUtil.asyncRepeat(100)(
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
//   const ranks: IRank[] = await ArrayUtil.asyncRepeat(5)(async () => {
//     const rank: IRank = {
//       id: v4(),
//       good_name: RandomGenerator.name(),
//       good_total_call_count: RANDOM_INT,
//     };
//     return typia.assertEquals(rank);
//   });
//
//   const statistics =
//     await HubApi.functional.hub.customers.statistics.goods.create(
//       pool.customer,
//       {
//         id: order.id,
//         total_call_count: RANDOM_INT,
//         total_failed_count: RANDOM_INT,
//         latency: RANDOM_LATENCY,
//         sale_name: RandomGenerator.name(),
//         charts: charts,
//         ranks: ranks,
//       },
//     );
//   typia.assertEquals(statistics);
//
//   return statistics;
// };
// const RANDOM_INT = Math.floor(Math.random() * 10000);
// const RANDOM_LATENCY =
//   Math.floor(Math.random() * 100) / 100 + Math.floor(Math.random() * 901) + 100;
// const DAY = 24 * 60 * 60 * 1000;
