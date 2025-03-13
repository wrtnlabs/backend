import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale } from "./internal/generate_random_sale";
import { validate_sale_at } from "./internal/validate_sale_at";
import { validate_sale_index } from "./internal/validate_sale_index";

export const test_api_hub_sale_suspend = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);
  await test_api_hub_customer_create(pool);

  const validate = async (possible: boolean) => {
    await validate_sale_index(pool)([sale])(possible);
    await validate_sale_at(pool)(sale)(possible);
    if (possible) await generate_random_cart_commodity(pool, sale);
    else
      await TestValidator.httpError("customer")(422)(() =>
        generate_random_cart_commodity(pool, sale),
      );
  };

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  await HubApi.functional.hub.sellers.sales.suspend(pool.seller, sale.id);
  await validate(false);

  await HubApi.functional.hub.sellers.sales.restore(pool.seller, sale.id);
  await validate(true);
};
