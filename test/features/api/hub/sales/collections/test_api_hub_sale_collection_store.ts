import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSaleCollection } from "@wrtnlabs/os-api/lib/structures/hub/sales/collections/IHubSaleCollection";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale_collection } from "./internal/generate_random_sale_collection";

export const test_api_hub_sale_collection_store = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_create(pool);
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  const collection: IHubSaleCollection.IForAdmin =
    await generate_random_sale_collection(pool);

  const found: IHubSaleCollection.IForAdmin =
    await HubApi.functional.hub.admins.sales.collections.at(
      pool.admin,
      collection.id,
    );
  TestValidator.equals("collections")(collection)(found);

  await HubApi.functional.hub.admins.sales.collections.erase(
    pool.admin,
    collection.id,
  );

  await TestValidator.httpError("not found")(404)(
    async () =>
      await HubApi.functional.hub.admins.sales.collections.at(
        pool.admin,
        collection.id,
      ),
  );
};
