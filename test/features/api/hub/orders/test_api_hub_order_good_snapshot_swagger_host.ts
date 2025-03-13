import { TestValidator } from "@nestia/e2e";
import { OpenApi } from "@samchon/openapi";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";

import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_order } from "./internal/generate_random_order";
import { generate_random_order_publish } from "./internal/generate_random_order_publish";

export const test_api_hub_order_good_snapshot_swagger_host = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 액터 준비
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);
  await test_api_hub_customer_join(pool);

  // 매물에서 주문까지 일괄 생성
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    await generate_random_sale(pool, "approved"),
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order);

  // 스웨거 조회시, 고객은 호스트 주소가 다름
  const good: IHubOrderGood = order.goods[0];
  const sale: IHubSaleSnapshot.IInvert = good.commodity.sale;
  const unit: IHubSaleUnit.IInvert = sale.units[0];
  const swagger: OpenApi.IDocument =
    await HubApi.functional.hub.customers.orders.goods.snapshots.swagger(
      pool.customer,
      order.id,
      good.id,
      sale.snapshot_id,
      {
        unit_id: unit.id,
      },
    );

  const hosts: string[] = swagger.servers!.map((server) => server.url);
  TestValidator.equals("hosts")(hosts)(
    ["real", "dev"].map(
      (type) =>
        `${HubGlobal.env.HUB_PROXY_HOST}/hub/customers/orders/${order.id}/goods/${good.id}/api/${type}/units/${unit.id}`,
    ),
  );
};
