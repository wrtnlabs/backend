import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderDiscountable } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderDiscountable";

import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "./internal/generate_random_order";
import { validate_api_hub_order_discountable } from "./internal/validate_api_hub_order_discountable";

export const test_api_hub_order_discountable_after_erase =
  validate_api_hub_order_discountable(async (pool, props) => {
    await HubApi.functional.hub.customers.orders.erase(
      pool.customer,
      props.order.id,
    );

    // GENERATE ORDER AGAIN
    const commodities: IHubCartCommodity[] = await ArrayUtil.asyncMap(
      props.sales,
    )((s) => generate_random_cart_commodity(pool, s));
    const order: IHubOrder = await generate_random_order(pool, commodities);

    // VALIDATE DISCOUNTABLE INFO
    const discountable: IHubOrderDiscountable =
      await HubApi.functional.hub.customers.orders.discountable(
        pool.customer,
        order.id,
        {
          good_ids: null,
        },
      );
    TestValidator.equals("amount")(
      discountable.combinations.map((c) => c.amount),
    )(props.discountable.combinations.map((c) => c.amount));
    TestValidator.equals("coupons.length")(
      discountable.combinations.map((c) => c.coupons.length),
    )(props.discountable.combinations.map((c) => c.coupons.length));
  });
