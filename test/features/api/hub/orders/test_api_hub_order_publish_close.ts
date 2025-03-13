import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_order } from "./internal/generate_random_order";
import { generate_random_order_publish } from "./internal/generate_random_order_publish";

export const test_api_hub_order_publish_close = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 관리자와 판매자 준비
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  // 매물에서 주문까지 일괄 생성
  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order, {
    opened_at: new Date().toISOString(),
    closed_at: null,
  });

  const time: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await HubApi.functional.hub.customers.orders.publish.close(
    pool.customer,
    order.id,
    {
      closed_at: time.toISOString(),
    },
  );

  const read: IHubOrder = await HubApi.functional.hub.customers.orders.at(
    pool.customer,
    order.id,
  );

  TestValidator.equals("closed_at")(read.goods.map((g) => g.closed_at))(
    read.goods.map(() => time.toISOString()),
  );
};
