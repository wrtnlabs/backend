import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { validate_api_hub_order_discountable } from "./internal/validate_api_hub_order_discountable";

export const test_api_hub_order_discount_impossible =
  validate_api_hub_order_discountable(async (pool, props) => {
    await TestValidator.httpError("impossible")(422)(() =>
      HubApi.functional.hub.customers.orders.discount(
        pool.customer,
        props.order.id,
        {
          coupon_ids: [
            props.discountable.combinations[0].coupons[0].id,
            props.discountable.combinations[1].coupons[0].id,
          ],
        },
      ),
    );
  });
