import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "./internal/generate_random_sale";

export const test_api_hub_sale_user_prompt = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 관리자, 고객 및 판매자 모두 준비
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_create(pool);
  await test_api_hub_seller_join(pool);

  // 매물 및 검증기 준비
  const sale: IHubSale = await generate_random_sale(pool, "approved", {
    user_prompt_examples: [
      {
        value: "Hello, World",
        icon_url: "https://picsum.photos/200/300?random",
      },
    ],
  });

  await test_api_hub_customer_create(pool, undefined, undefined, "ko");
  const ko = await HubApi.functional.hub.customers.sales.at(
    pool.customer,
    sale.id,
  );

  TestValidator.equals("user_prompt_examples ko")("안녕하세요, 세상")(
    ko.user_prompt_examples[0].value,
  );

  await test_api_hub_customer_create(pool, undefined, undefined, "zh");
  const zh = await HubApi.functional.hub.customers.sales.at(
    pool.customer,
    sale.id,
  );

  TestValidator.equals("user_prompt_examples zh")("你好世界")(
    zh.user_prompt_examples[0].value,
  );
};
