import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderPrice } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderPrice";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_coupon } from "../coupons/internal/generate_random_coupon";
import { prepare_random_coupon } from "../coupons/internal/prepare_random_coupon";
import { generate_random_sale_of_toss_payments } from "../sales/internal/generate_random_sale_of_toss_payments";
import { generate_random_order } from "./internal/generate_random_order";

export const test_api_hub_order_discount_by_coupon = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale_of_toss_payments(
    pool,
    "approved",
    {
      threshold: 250,
      fixed: 10_000,
      variable: 100,
    },
  );
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);

  const coupon: IHubCoupon = await generate_random_coupon({
    types: [],
    direction: "include",
    customer: null,
    sale,
    prepare: (criterias) =>
      prepare_random_coupon({
        criterias,
        discount: {
          unit: "percent",
          value: 50,
          limit: null,
          threshold: null,
        },
      }),
    create: (input) =>
      HubApi.functional.hub.admins.coupons.create(pool.admin, input),
  });

  const error: Error | null = await TestValidator.proceed(async () => {
    const price: IHubOrderPrice =
      await HubApi.functional.hub.customers.orders.discount(
        pool.customer,
        order.id,
        {
          coupon_ids: [coupon.id],
        },
      );
    TestValidator.equals("price.value")(price.value)(price.deposit * 2);
    TestValidator.equals("price.ticket")(price.deposit)(price.ticket);

    const read: IHubOrder = await HubApi.functional.hub.customers.orders.at(
      pool.customer,
      order.id,
    );

    TestValidator.equals("price")(read.price)(price);

    for (const good of read.goods) {
      TestValidator.equals("good.price")(good.price.value)(
        good.price.deposit * 2,
      );
      TestValidator.equals("good.price")(good.price.value)(
        good.price.ticket * 2,
      );
      for (const unit of good.commodity.sale.units) {
        TestValidator.equals("stock.price.variable")(
          unit.stock.price.variable.value,
        )(unit.stock.price.variable.deposit * 2);
        TestValidator.equals("stock.price.fixed")(unit.stock.price.fixed.value)(
          unit.stock.price.fixed.ticket * 2,
        );
      }
    }
  });
  if (error !== null) throw error;
  await HubApi.functional.hub.admins.coupons.destroy(pool.admin, coupon.id);
};
