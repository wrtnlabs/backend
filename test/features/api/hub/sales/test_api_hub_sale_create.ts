import { TestValidator } from "@nestia/e2e";

import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "./internal/generate_random_sale";
import { validate_sale_index } from "./internal/validate_sale_index";

export const test_api_hub_sale_create = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 관리자, 고객 및 판매자 모두 준비
  await test_api_hub_customer_create(pool);
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  // 판매자의 매물 생성 (심사 개시되지 아니함)
  const sale: IHubSale = await generate_random_sale(pool, null);
  TestValidator.equals("audit")(sale.audit)(null);

  // 고객은 심사되지 않은 위 매물을 볼 수 없다.
  await validate_sale_index(pool)([sale])(false);
};
