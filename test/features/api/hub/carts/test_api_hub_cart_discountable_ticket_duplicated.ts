import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCouponTicket } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponTicket";
import { IHubCartDiscountable } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartDiscountable";

import { validate_api_hub_cart_discountable } from "./internal/validate_api_hub_cart_discountable";

export const test_api_hub_cart_discountable_ticket_duplicated =
  validate_api_hub_cart_discountable(async (pool, props) => {
    await ArrayUtil.asyncMap(props.coupons)(async (coupon) => {
      await ArrayUtil.asyncRepeat(3)(async () => {
        const t: IHubCouponTicket =
          await HubApi.functional.hub.customers.coupons.tickets.create(
            pool.customer,
            {
              coupon_id: coupon.id,
            },
          );
        return t;
      });
    });

    const discountable: IHubCartDiscountable =
      await HubApi.functional.hub.customers.carts.commodities.discountable(
        pool.customer,
        null,
        {
          commodity_ids: props.commodities.map((commodity) => commodity.id),
          pseudos: [],
        },
      );
    TestValidator.equals("combinations.length")(
      discountable.combinations.length,
    )(2);
    TestValidator.equals("combinations[].amount")(
      discountable.combinations.map((c) => c.amount),
    )(props.discountable.combinations.map((c) => c.amount));
    TestValidator.equals("combinations[].coupons.length")(
      discountable.combinations.map((c) => c.coupons.length),
    )([0, 0]);
    TestValidator.equals("combinations[].tickets.length")(
      discountable.combinations.map((c) => c.tickets.length),
    )([3, 1]);
  });
