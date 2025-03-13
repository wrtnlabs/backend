import { TestValidator } from "@nestia/e2e";
import { OpenApi } from "@samchon/openapi";
import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import typia from "typia";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "./internal/generate_random_sale";
import { prepare_random_sale_unit } from "./internal/prepare_random_sale_unit";

export const test_api_hub_sale_snapshot_unit_swagger_at = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 관리자, 고객 및 판매자 모두 준비
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_create(pool);
  await test_api_hub_seller_join(pool);

  const response: Response = await fetch(
    "https://wrtnlabs.github.io/connectors/swagger/connectors/google-shopping-iherb.swagger.json",
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
  const json = await response.json();
  const iherb: OpenApi.IDocument = typia.assert<OpenApi.IDocument>(json);

  // 매물 및 검증기 준비
  const sale: IHubSale = await generate_random_sale(pool, "approved", {
    units: [prepare_random_sale_unit({ swagger: iherb })],
  });

  const swagger: OpenApi.IDocument =
    await HubApi.functional.hub.customers.sales.swagger(
      pool.customer,
      sale.id,
      { unit_id: sale.units[0].id },
    );

  const swaggerWithDefaults = injectDefaults(
    JSON.parse(JSON.stringify(swagger)),
    iherb,
  );

  TestValidator.equals("swagger", (key) => key.startsWith("x-"))(iherb)(
    swaggerWithDefaults,
  );
};

function injectDefaults(target: any, source: any) {
  if (typeof source !== "object" || source === null) {
    return target;
  }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === "object" && source[key] !== null) {
        if (Array.isArray(source[key])) {
          target[key] = target[key] || [];
          source[key].forEach((item: any, index: number) => {
            target[key][index] = injectDefaults(target[key][index] || {}, item);
          });
        } else {
          target[key] = injectDefaults(target[key] || {}, source[key]);
        }
      } else if (key === "default" && !(key in target)) {
        target[key] = source[key];
      }
    }
  }

  return target;
}
