// import { TestValidator } from "@nestia/e2e";

// import HubApi from "@wrtnlabs/os-api/lib/index";
// import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

// import { ConnectionPool } from "../../../../ConnectionPool";
// import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
// import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
// import { generate_random_sale } from "./internal/generate_random_sale";
// import { prepare_random_sale } from "./internal/prepare_random_sale";

// export const test_api_hub_sale_update_duplicated_version = async (
//   pool: ConnectionPool,
// ): Promise<void> => {
//   await test_api_hub_admin_login(pool);
//   await test_api_hub_seller_join(pool);

//   const sale: IHubSale = await generate_random_sale(pool, "approved");
//   await TestValidator.httpError("duplicated version")(422)(async () =>
//     HubApi.functional.hub.sellers.sales.update(
//       pool.seller,
//       sale.id,
//       await prepare_random_sale(pool, {
//         version: sale.version,
//       }),
//     ),
//   );
// };
