import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { prepare_random_cart_commodity } from "./internal/prepare_random_cart_commodity";

export async function test_api_hub_cart_commodity_store_unapproved(
  pool: ConnectionPool,
): Promise<void> {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);
  await test_api_hub_customer_create(pool);

  for (const state of [null, "agenda", "rejected"] as const)
    await TestValidator.httpError("unapproved sale")(404)(async () =>
      HubApi.functional.hub.customers.carts.commodities.create(
        pool.customer,
        null,
        prepare_random_cart_commodity(await generate_random_sale(pool, state)),
      ),
    );
}
