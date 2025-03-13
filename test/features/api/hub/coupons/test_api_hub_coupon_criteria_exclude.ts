import { RandomGenerator, TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubCouponCriteria } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteria";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubCartDiscountable } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartDiscountable";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderDiscountable } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderDiscountable";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";
import { IHubSection } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubSection";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "../orders/internal/generate_random_order";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { prepare_random_coupon } from "./internal/prepare_random_coupon";
import { prepare_random_coupon_criteria } from "./internal/prepare_random_coupon_criteria";

export async function test_api_hub_coupon_criteria_exclude(
  pool: ConnectionPool,
): Promise<void> {
  // PREPARE ASSETS
  await test_api_hub_admin_login(pool);

  const outside: IGroup = await generate_group(pool, 0);
  const inside: IGroup = await generate_group(pool, 1);

  const generator = async (
    criterias: IHubCouponCriteria.ICreate[],
  ): Promise<IHubCoupon> => {
    const coupon: IHubCoupon =
      await HubApi.functional.hub.admins.coupons.create(
        pool.admin,
        prepare_random_coupon({ criterias }),
      );
    return coupon;
  };
  const erasure = (coupon: IHubCoupon) =>
    HubApi.functional.hub.admins.coupons.destroy(pool.admin, coupon.id);

  for (const x of typia.misc.literals<IHubCouponCriteria.Type>()) {
    // VALIDATE EXCLUDE ONLY CASE
    const exclude: IHubCoupon = await generator([
      prepare_random_coupon_criteria({
        customer: inside.customer,
        sale: inside.sale,
        direction: "exclude",
        type: x,
      }),
    ]);
    const e1 = await TestValidator.proceed(async () => {
      await validate(pool, inside, false);
      await validate(pool, outside, true);
    });
    await erasure(exclude);
    if (e1) throw e1;

    // VALIDATE COMPOSITE CASE
    const composite: IHubCoupon = await generator(
      typia.misc
        .literals<IHubCouponCriteria.Type>()
        .filter((y) => x !== y)
        .map((y) =>
          prepare_random_coupon_criteria({
            customer: inside.customer,
            sale: inside.sale,
            direction: "include",
            type: y,
          }),
        ),
    );
    const error: Error | null = await TestValidator.proceed(async () => {
      await validate(pool, inside, true);
      await validate(pool, outside, false);
    });
    await erasure(composite);
    if (error) throw error;
  }
}

async function validate(
  pool: ConnectionPool,
  { customer, sale }: IGroup,
  possible: boolean,
): Promise<void> {
  // CUSTOMER CAME BACK
  Object.assign(pool.customer.headers!, customer.setHeaders);

  try {
    sale = await HubApi.functional.hub.customers.sales.at(
      pool.customer,
      sale.id,
    );
  } catch {
    return;
  }

  // INSERT INTO A CART
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );

  // VALIDATE THROUGH CART-DISCOUNTABLE
  const preview: IHubCartDiscountable =
    await HubApi.functional.hub.customers.carts.commodities.discountable(
      pool.customer,
      null,
      {
        commodity_ids: [commodity.id],
        pseudos: [],
      },
    );
  TestValidator.equals("predicate on cart")(possible)(
    !!preview.combinations.length,
  );

  // PURCHASE THE SALE
  const order: IHubOrder = await generate_random_order(pool, [commodity]);

  // VALIDATE AGAIN THROUGH ORDER-DISCOUNTABLE
  const discountable: IHubOrderDiscountable =
    await HubApi.functional.hub.customers.orders.discountable(
      pool.customer,
      order.id,
      { good_ids: null },
    );
  TestValidator.equals("predicate on order")(possible)(
    !!discountable.combinations.length,
  );
}

async function generate_group(
  pool: ConnectionPool,
  i: number,
): Promise<IGroup> {
  // CREATE NEW CHANNEL AND SECTION
  const channel: IHubChannel =
    await HubApi.functional.hub.admins.systematic.channels.create(pool.admin, {
      name: RandomGenerator.name(),
      code: RandomGenerator.alphabets(16),
    });
  const section: IHubSection =
    await HubApi.functional.hub.admins.systematic.sections.create(pool.admin, {
      name: RandomGenerator.name(),
      code: RandomGenerator.alphabets(16),
    });

  // A NEW CUSTOMER
  const customer: IHubCustomer.IAuthorized =
    await HubApi.functional.hub.customers.authenticate.create(pool.customer, {
      href: i === 0 ? "https://hub.wrtn.ai" : "https://hub.wrtn.io",
      referrer: i === 0 ? "https://www.google.com" : "https://www.naver.com",
      channel_code: channel.code,
      external_user: null,
      lang_code: "ko",
    });

  const activated: IHubCustomer =
    await HubApi.functional.hub.customers.citizens.activate(pool.customer, {
      mobile: RandomGenerator.mobile(),
      name: RandomGenerator.name(),
    });
  customer.citizen = activated.citizen;

  // A NEW SALE WITH NEW SELLER
  await test_api_hub_seller_join(pool);
  const sale: IHubSale = await generate_random_sale(pool, "approved", {
    section_code: section.code,
  });
  return { customer, sale };
}

interface IGroup {
  customer: IHubCustomer.IAuthorized;
  sale: IHubSale;
}
