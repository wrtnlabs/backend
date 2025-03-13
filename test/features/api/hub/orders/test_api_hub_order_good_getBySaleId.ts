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

export const test_api_hub_order_good_getBySaleId = async (
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
  order.publish = await generate_random_order_publish(pool, order);

  const invert: IHubOrderGood.IInvert =
    await HubApi.functional.hub.customers.orders.goods.getBySaleId(
      pool.customer,
      sale.id,
    );
  TestValidator.equals("good.id")(order.goods[0].id)(invert.id);
  TestValidator.equals("sale.id")(sale.id)(invert.commodity.sale.id);

  const newSale: IHubSale = await generate_random_sale(pool, "approved");
  const failure = (title: string) =>
    TestValidator.httpError(`not purchased (${title})`)(404)(() =>
      HubApi.functional.hub.customers.orders.goods.getBySaleId(
        pool.customer,
        newSale.id,
      ),
    );
  await failure("nothing");

  const newCommodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    newSale,
  );
  await failure("cart");

  const newOrder: IHubOrder = await generate_random_order(pool, [newCommodity]);
  await failure("order");

  newOrder.publish = await generate_random_order_publish(pool, newOrder, {
    opened_at: new Date(Date.now() + 24 * 60 * 60 * 1_000).toISOString(),
  });
  await failure("out of contract");
};
