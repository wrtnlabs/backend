import { ArrayUtil, TestValidator } from "@nestia/e2e";

import { HubCartCommodityDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub";
import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderPrice } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderPrice";

import { TestGlobal } from "../../../../TestGlobal";
import { generate_random_order } from "./internal/generate_random_order";
import { validate_api_hub_order_discountable } from "./internal/validate_api_hub_order_discountable";

export const test_api_hub_order_discount_after_erase =
  validate_api_hub_order_discountable(async (pool, props) => {
    // PREPARE NEW COMMODITIES
    const commodities: IHubCartCommodity[] = await ArrayUtil.asyncMap(
      props.order.goods.map((good) =>
        HubCartCommodityDiagnoser.replica(good.commodity),
      ),
    )((input) =>
      HubApi.functional.hub.customers.carts.commodities.create(
        pool.customer,
        null,
        input,
      ),
    );

    // ERASE AFTER DISCOUNT
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
    await HubApi.functional.hub.customers.orders.erase(
      pool.customer,
      props.order.id,
    );

    // NEW ORDER
    const newbie: IHubOrder = await generate_random_order(pool, commodities);

    // DISCOUNT AGAIN
    const again: IHubOrderPrice =
      await HubApi.functional.hub.customers.orders.discount(
        pool.customer,
        newbie.id,
        {
          coupon_ids: props.discountable.combinations[0].coupons.map(
            (coupon) => coupon.id,
          ),
        },
      );
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
