import { TestValidator } from "@nestia/e2e";
import { sleep_for } from "tstl";

import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_cart_commodity } from "./internal/generate_random_cart_commodity";

export async function test_api_hub_cart_commodity_store_closed(
  pool: ConnectionPool,
): Promise<void> {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);
  await test_api_hub_customer_create(pool);

  const time: Date = new Date(Date.now() + 4_000);
  const sale: IHubSale = await generate_random_sale(pool, "approved", {
    opened_at: new Date().toISOString(),
    closed_at: time.toISOString(),
  });

  const create = async () => {
    await generate_random_cart_commodity(pool, sale);
  };
  await create();
  await sleep_for(4_000);
  await TestValidator.httpError("closed sale")(422)(create);
}
