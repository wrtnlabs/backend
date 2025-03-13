// import { ArrayUtil, TestValidator } from "@nestia/e2e";
// import typia from "typia";
//
// import HubApi from "@wrtnlabs/os-api/lib/index";
// import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
// import { IHubSaleAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleAggregate";
// import { IHubSaleGoodCustomerAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleGoodCustomerAggregate";
//
// import { ConnectionPool } from "../../../../ConnectionPool";
// import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
// import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
// import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
// import { generate_random_customer_statistics } from "./internal/generate_random_customer_statistics";
// import { generate_random_statistics } from "./internal/generate_random_statistics";
//
// export const test_api_hub_statistics_index_search = async (
//   pool: ConnectionPool,
// ): Promise<void> => {
//   await test_api_hub_customer_join(pool);
//   await test_api_hub_seller_join(pool);
//   await test_api_hub_admin_login(pool);
//
//   await ArrayUtil.asyncRepeat(25)(async () => {
//     await test_api_hub_seller_join(pool);
//     await generate_random_statistics(pool);
//   });
//
//   // Seller 부분.
//   const sellerTotal: IPage<IHubSaleAggregate> =
//     await HubApi.functional.hub.sellers.statistics.goods.index(pool.seller, {
//       limit: REPEAT,
//     });
//   typia.assertEquals(sellerTotal);
//
//   const sellerSearch = TestValidator.search("statistics.goods.index")(
//     async (input: IHubSaleAggregate.IRequest.ISearch) => {
//       const page: IPage<IHubSaleAggregate> =
//         await HubApi.functional.hub.sellers.statistics.goods.index(
//           pool.seller,
//           {
//             limit: REPEAT,
//             search: input,
//           },
//         );
//       return typia.assertEquals(page).data;
//     },
//   )(sellerTotal.data, 4);
//
//   await sellerSearch({
//     fields: ["good.id"],
//     values: (sale) => [sale.id],
//     request: ([id]) => ({
//       term: {
//         count_unit: 1,
//         time_unit: "month",
//       },
//       id: [id],
//     }),
//     filter: (sale, [good_name]) => sale.good.good_name.includes(good_name),
//   });
//
//   // Customer 부분.
//   await ArrayUtil.asyncRepeat(25)(async () => {
//     await test_api_hub_customer_join(pool);
//     await generate_random_customer_statistics(pool);
//   });
//
//   const customerTotal: IPage<IHubSaleGoodCustomerAggregate> =
//     await HubApi.functional.hub.customers.statistics.goods.index(
//       pool.customer,
//       {
//         limit: REPEAT,
//       },
//     );
//   typia.assertEquals(customerTotal);
//
//   const customerSearch = TestValidator.search("statistics.index")(
//     async (input: IHubSaleGoodCustomerAggregate.IRequest.ISearch) => {
//       const page: IPage<IHubSaleGoodCustomerAggregate> =
//         await HubApi.functional.hub.customers.statistics.goods.index(
//           pool.customer,
//           {
//             limit: REPEAT,
//             search: input,
//           },
//         );
//       return typia.assertEquals(page).data;
//     },
//   )(customerTaotal.data, 4);
//
//   await customerSearch({
//     fields: ["id"],
//     values: (sale) => [sale.id],
//     request: ([id]) => ({
//       term: {
//         count_unit: 1,
//         time_unit: "month",
//       },
//       id: [id],
//     }),
//     filter: (sale, [good_name]) => sale.sale_name.includes(good_name),
//   });
// };
// const REPEAT = 25;
