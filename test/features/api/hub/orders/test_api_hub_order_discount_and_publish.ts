import HubApi from "@wrtnlabs/os-api/lib/index";

import { generate_random_order_publish } from "./internal/generate_random_order_publish";
import { validate_api_hub_order_discountable } from "./internal/validate_api_hub_order_discountable";

export const test_api_hub_order_discount_and_publish =
  validate_api_hub_order_discountable(async (pool, props) => {
    await HubApi.functional.hub.customers.orders.discount(
      pool.customer,
      props.order.id,
      {
        coupon_ids: props.discountable.combinations[0].coupons.map(
          (coupon) => coupon.id,
        ),
      },
    );
    await generate_random_order_publish(pool, props.order);
  });
