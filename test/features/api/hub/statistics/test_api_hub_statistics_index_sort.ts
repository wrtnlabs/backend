// import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";
// import typia from "typia";
//
// import HubApi from "@wrtnlabs/os-api/lib/index";
// import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
// import { IHubSaleAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleAggregate";
//
// import { ConnectionPool } from "../../../../ConnectionPool";
// import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
// import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
// import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
// import { generate_random_statistics } from "./internal/generate_random_statistics";
//
// export const test_api_hub_statistics_index_sort = async (
//   pool: ConnectionPool,
// ) => {
//   await test_api_hub_customer_join(pool);
//   await test_api_hub_seller_join(pool);
//   await test_api_hub_admin_login(pool);
//
//   await ArrayUtil.asyncRepeat(25)(async () => {
//     await test_api_hub_seller_join(pool);
//     await generate_random_statistics(pool);
//   });
//
//   const validator = TestValidator.sort("statistics.index")<
//     IHubSaleAggregate,
//     IHubSaleAggregate.IRequest.SortableColumns,
//     IPage.Sort<IHubSaleAggregate.IRequest.SortableColumns>
//   >(async (input: IPage.Sort<IHubSaleAggregate.IRequest.SortableColumns>) => {
//     const page: IPage<IHubSaleAggregate> =
//       await HubApi.functional.hub.sellers.statistics.goods.index(pool.seller, {
//         sort: input,
//       });
//     return typia.assertEquals(page).data;
//   });
//
//   const components = [validator("id")(GaffComparator.strings((o) => o.id))];
//
//   for (const comp of components) {
//     await comp("+");
//     await comp("-");
//   }
// };
