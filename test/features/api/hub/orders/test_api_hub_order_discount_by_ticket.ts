import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCouponTicket } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponTicket";
import { IHubOrderPrice } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderPrice";

import { TestGlobal } from "../../../../TestGlobal";
import { validate_api_hub_order_discountable } from "./internal/validate_api_hub_order_discountable";

export const test_api_hub_order_discount_by_ticket =
  validate_api_hub_order_discountable(async (pool, props) => {
    const tickets: IHubCouponTicket[] = await ArrayUtil.asyncMap(
      props.discountable.combinations[0].coupons,
    )((coupon) =>
      HubApi.functional.hub.customers.coupons.tickets.create(pool.customer, {
        coupon_id: coupon.id,
      }),
    );

    const price: IHubOrderPrice =
      await HubApi.functional.hub.customers.orders.discount(
        pool.customer,
        props.order.id,
        {
          coupon_ids: tickets.map((t) => t.coupon.id),
        },
      );
    TestValidator.equals("price.ticket")(price.ticket)(15_000);
    TestValidator.equals(
      "price.ticket_payments",
      TestGlobal.exceptSaleKeys,
    )(
      price.ticket_payments
        .map((tp) => tp.ticket.coupon)
        .sort((a, b) => a.id.localeCompare(b.id)),
    )(tickets.map((t) => t.coupon).sort((a, b) => a.id.localeCompare(b.id)));
  });
