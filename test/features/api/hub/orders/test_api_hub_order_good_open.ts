import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_order } from "./internal/generate_random_order";
import { generate_random_order_publish } from "./internal/generate_random_order_publish";

export const test_api_hub_order_good_open = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order, {
    opened_at: null,
    closed_at: null,
  });

  const good: IHubOrderGood = order.goods[0];
  const opener = async (time: Date | null) => {
    await HubApi.functional.hub.customers.orders.goods.open(
      pool.customer,
      order.id,
      good.id,
      {
        opened_at: time?.toISOString() ?? null,
      },
    );
    const read: IHubOrderGood.IInvert =
      await HubApi.functional.hub.customers.orders.goods.at(
        pool.customer,
        order.id,
        good.id,
      );
    TestValidator.equals("opened_at")(read.opened_at)(
      time?.toISOString() ?? null,
    );
  };

  await TestValidator.httpError("past")(422)(() =>
    opener(new Date(Date.now() - DAY)),
  );
  await opener(new Date(Date.now() + DAY));
  await opener(null);
  await opener(new Date());
  await TestValidator.httpError("already opened")(422)(() =>
    opener(new Date()),
  );
};

const DAY = 24 * 60 * 60 * 1_000;
