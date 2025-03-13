import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale_collection } from "./internal/generate_random_sale_collection";

export const test_api_hub_sale_collection_at = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_seller_join(pool);
  await test_api_hub_admin_login(pool);

  const collection = await generate_random_sale_collection(pool);
  const suspendSale = collection.sales[0];

  await HubApi.functional.hub.sellers.sales.suspend(
    pool.seller,
    suspendSale.id,
  );
  await test_api_hub_customer_create(pool);
  const found = await HubApi.functional.hub.customers.sales.collections.at(
    pool.customer,
    collection.id,
  );

  TestValidator.equals("suspend sale")(
    found.sales.some((s) => s.id === suspendSale.id),
  )(false);

  await test_api_hub_customer_create(pool, undefined, undefined, "ko");
  const ko = await HubApi.functional.hub.customers.sales.collections.at(
    pool.customer,
    collection.id,
  );
  TestValidator.equals("ko collections")(ko.lang_code)("ko");

  await test_api_hub_customer_create(pool, undefined, undefined, "en");
  const en = await HubApi.functional.hub.customers.sales.collections.at(
    pool.customer,
    collection.id,
  );
  TestValidator.equals("en collections")(en.lang_code)("en");

  // 작성하지 않은 언어 코드를 넣으면 해당 언어로 번역 하여 반환.
  await test_api_hub_customer_create(pool, undefined, undefined, "zh");
  const zh = await HubApi.functional.hub.customers.sales.collections.at(
    pool.customer,
    collection.id,
  );
  TestValidator.equals("zh collections")(zh.lang_code)("zh");
};
