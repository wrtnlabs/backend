// import { TestValidator } from "@nestia/e2e";

// import HubApi from "@wrtnlabs/os-api/lib/index";
// import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
// import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
// import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";

// import { ConnectionPool } from "../../../../ConnectionPool";
// import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
// import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
// import { generate_random_sale } from "./internal/generate_random_sale";
// import { generate_random_sale_audit } from "./internal/generate_random_sale_audit";
// import { prepare_random_sale } from "./internal/prepare_random_sale";

// export const test_api_hub_sale_snapshot_update_version_description = async (
//   pool: ConnectionPool,
// ) => {
//   await test_api_hub_admin_login(pool);
//   await test_api_hub_seller_join(pool);

//   const sale: IHubSale = await generate_random_sale(pool, "approved");
//   const updated: IHubSale = await HubApi.functional.hub.sellers.sales.update(
//     pool.seller,
//     sale.id,
//     await prepare_random_sale(pool),
//   );

//   const audit: IHubSaleAudit = await generate_random_sale_audit(pool, updated);
//   audit.approval = await HubApi.functional.hub.admins.sales.audits.approve(
//     pool.admin,
//     sale.id,
//     audit.id,
//     {
//       fee_ratio: 0.1,
//       snapshot_id: null,
//     },
//   );

//   await HubApi.functional.hub.sellers.sales.snapshots.version.description(
//     pool.seller,
//     sale.id,
//     sale.snapshot_id,
//     {
//       version_description: "A",
//     },
//   );
//   await HubApi.functional.hub.sellers.sales.snapshots.version.description(
//     pool.seller,
//     sale.id,
//     updated.snapshot_id,
//     {
//       version_description: "B",
//     },
//   );

//   const A: IHubSaleSnapshot =
//     await HubApi.functional.hub.sellers.sales.snapshots.at(
//       pool.seller,
//       sale.id,
//       sale.snapshot_id,
//     );
//   const B: IHubSaleSnapshot =
//     await HubApi.functional.hub.sellers.sales.snapshots.at(
//       pool.seller,
//       sale.id,
//       updated.snapshot_id,
//     );

//   TestValidator.equals("desc A")(A.version_description)("A");
//   TestValidator.equals("desc B")(B.version_description)("B");
// };
