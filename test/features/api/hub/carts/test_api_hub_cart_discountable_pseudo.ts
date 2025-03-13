import { TestValidator } from "@nestia/e2e";

import { HubCartCommodityDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub";
import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubCartDiscountable } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartDiscountable";

import { validate_api_hub_cart_discountable } from "./internal/validate_api_hub_cart_discountable";

export const test_api_hub_cart_discountable_pseudo =
  validate_api_hub_cart_discountable(async (pool, props) => {
    const pseudos: IHubCartCommodity.ICreate[] = props.commodities.map(
      (commodity) => HubCartCommodityDiagnoser.replica(commodity),
    );
    const discountable: IHubCartDiscountable =
      await HubApi.functional.hub.customers.carts.commodities.discountable(
        pool.customer,
        null,
        {
          commodity_ids: [],
          pseudos,
        },
      );
    TestValidator.equals("combinations.length")(
      discountable.combinations.length,
    )(2);
    TestValidator.equals("combinations[].amount")(
      discountable.combinations.map((c) => c.amount),
    )([15_000, 5_000]);
    TestValidator.equals("combinations[].coupons.length")(
      discountable.combinations.map((c) => c.coupons.length),
    )([3, 1]);
  });
