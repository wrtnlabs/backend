import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_cart_commodity } from "./internal/generate_random_cart_commodity";

export async function test_api_hub_cart_commodity_store(
  pool: ConnectionPool,
): Promise<void> {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);
  await test_api_hub_customer_create(pool);

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );

  const page: IPage<IHubCartCommodity> =
    await HubApi.functional.hub.customers.carts.commodities.index(
      pool.customer,
      null,
      {
        limit: 1,
        sort: ["-commodity.created_at"],
      },
    );
  TestValidator.equals("create", TestGlobal.exceptSaleKeys)([commodity])(
    page.data,
  );
}
