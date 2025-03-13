import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale_collection } from "./internal/generate_random_sale_collection";

export const test_api_hub_sale_collection_index_translate = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_customer_create(pool);
  await test_api_hub_seller_join(pool);
  await test_api_hub_admin_login(pool);

  // 컬렉션 생성하면서 reference 저장
  const createdCollection = await generate_random_sale_collection(pool);

  // 나머지 컬렉션들 생성
  await ArrayUtil.asyncRepeat(REPEAT)(async () => {
    await generate_random_sale_collection(pool);
  });

  // 첫 번째 생성된 컬렉션의 세일 suspend
  await HubApi.functional.hub.sellers.sales.suspend(
    pool.seller,
    createdCollection.sales[0].id,
  );

  const after = await HubApi.functional.hub.customers.sales.collections.index(
    pool.customer,
    { limit: REPEAT, sort: ["+created_at"] },
  );

  TestValidator.equals("suspend sale")(createdCollection.sale_count - 1)(
    after.data[0].sale_count,
  );

  // 언어 테스트
  for (const lang of LANGUAGES) {
    await test_api_hub_customer_create(pool, undefined, undefined, lang);
    const result =
      await HubApi.functional.hub.customers.sales.collections.index(
        pool.customer,
        { limit: REPEAT, sort: ["+created_at"] },
      );

    TestValidator.equals(`${lang.toUpperCase()} collections`)(
      result.data.map((c) => c.lang_code).every((code) => code === lang),
    )(true);
  }
};

const REPEAT = 9;
const LANGUAGES = ["ko", "en", "zh"] as const;
