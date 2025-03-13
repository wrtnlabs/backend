import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubOrderPrice } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderPrice";

import { TestGlobal } from "../../../../TestGlobal";
import { validate_api_hub_order_discountable } from "./internal/validate_api_hub_order_discountable";

export const test_api_hub_order_discount_after_discount =
  validate_api_hub_order_discountable(async (pool, props) => {
    const discount = async () => {
      const price: IHubOrderPrice =
        await HubApi.functional.hub.customers.orders.discount(
          pool.customer,
          props.order.id,
          {
            coupon_ids: props.discountable.combinations[0].coupons.map(
              (coupon) => coupon.id,
            ),
          },
        );
      return price;
    };

    const price: IHubOrderPrice = await discount();
    const again: IHubOrderPrice = await discount();

    TestValidator.equals(
      "tickets",
      TestGlobal.exceptSaleKeys,
    )(
      price.ticket_payments
        .map((tp) => tp.ticket.coupon)
        .sort((a, b) => a.id.localeCompare(b.id)),
    )(
      again.ticket_payments
        .map((tp) => tp.ticket.coupon)
        .sort((a, b) => a.id.localeCompare(b.id)),
    );
  });
