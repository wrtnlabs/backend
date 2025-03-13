import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubCouponCriteria } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteria";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubCartDiscountable } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartDiscountable";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSection } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubSection";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { prepare_random_coupon } from "../../coupons/internal/prepare_random_coupon";
import { generate_random_sale } from "../../sales/internal/generate_random_sale";
import { generate_random_section } from "../../systematic/internal/generate_random_section";
import { generate_random_cart_commodity } from "./generate_random_cart_commodity";

export const validate_api_hub_cart_discountable =
  (
    next?: (
      pool: ConnectionPool,
      props: validate_api_hub_cart_discountable.IProps,
    ) => Promise<any>,
  ) =>
  async (pool: ConnectionPool): Promise<void> => {
    //----
    // PREPARE ASSETS
    //----
    // AUTHORIZE ACTORS
    const customer: IHubCustomer = await test_api_hub_customer_join(pool);
    await test_api_hub_admin_login(pool);
    await test_api_hub_seller_join(pool);

    // GENERATE SALES
    const sales: IHubSale[] = await ArrayUtil.asyncRepeat(3)(() =>
      generate_random_sale(pool, "approved"),
    );

    // GENERATE COMMODITIES
    const commodities: IHubCartCommodity[] = await ArrayUtil.asyncMap(sales)(
      (s) => generate_random_cart_commodity(pool, s),
    );

    //----
    // GENERATE COUPONS
    //----
    const dummySection: IHubSection = await generate_random_section(pool);
    const dummySeller: IHubSeller = await test_api_hub_seller_join(pool);
    const generator =
      (exclusive: boolean) =>
      async (criteria: IHubCouponCriteria.ICreate | null) => {
        const c: IHubCoupon = await HubApi.functional.hub.admins.coupons.create(
          pool.admin,
          prepare_random_coupon({
            restriction: {
              exclusive,
            },
            discount: {
              unit: "amount",
              value: 5_000,
            },
            criterias: criteria ? [criteria] : [],
          }),
        );
        return c;
      };

    const coupons: IHubCoupon[] = [
      // DISCOUNTABLE
      await generator(true)(null),
      await generator(false)({
        type: "sale",
        direction: "include",
        sale_ids: [sales[0].id],
      }),
      await generator(false)({
        type: "seller",
        direction: "include",
        seller_ids: [sales[0].seller.id],
      }),
      await generator(false)({
        type: "section",
        direction: "include",
        section_codes: [sales[0].section.code],
      }),
      // OUT-OF-DISCOUNTABLE
      await generator(true)({
        type: "section",
        direction: "include",
        section_codes: [dummySection.code],
      }),
      await generator(true)({
        type: "seller",
        direction: "include",
        seller_ids: [dummySeller.id],
      }),
    ];

    //----
    // VALIDATE
    //----
    // GET DISCOUNTABLE INFO
    const discountable: IHubCartDiscountable =
      await HubApi.functional.hub.customers.carts.commodities.discountable(
        pool.customer,
        null,
        {
          commodity_ids: commodities.map((c) => c.id),
          pseudos: [],
        },
      );

    const error: Error | null = await TestValidator.proceed(async () => {
      // INSPECT SCENARIOS
      TestValidator.equals("combinations.length")(
        discountable.combinations.length,
      )(2);
      TestValidator.equals("combinations[].amount")(
        discountable.combinations.map((c) => c.amount),
      )([15_000, 5_000]);
      TestValidator.equals("combinations[].coupons.length")(
        discountable.combinations.map((c) => c.coupons.length),
      )([3, 1]);

      // FOR THE NEXT STEP
      if (next)
        await next(pool, {
          customer,
          sales,
          commodities,
          discountable,
          coupons,
          generator,
        });
    });

    // CLEAN UP TESTED ASSETS
    for (const c of coupons)
      await HubApi.functional.hub.admins.coupons.destroy(pool.admin, c.id);
    await HubApi.functional.hub.admins.systematic.sections.merge(pool.admin, {
      keep: sales[0].section.id,
      absorbed: [dummySection.id],
    });

    // TERMINATE
    if (error) throw error;
  };
export namespace validate_api_hub_cart_discountable {
  export interface IProps {
    customer: IHubCustomer;
    sales: IHubSale[];
    commodities: IHubCartCommodity[];
    discountable: IHubCartDiscountable;
    coupons: IHubCoupon[];
    generator: (
      exclusive: boolean,
    ) => (criteria: IHubCouponCriteria.ICreate) => Promise<IHubCoupon>;
  }
}
