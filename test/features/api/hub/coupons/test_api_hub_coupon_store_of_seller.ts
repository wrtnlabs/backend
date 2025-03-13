import { ArrayUtil, TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubCouponCriteria } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteria";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_coupon } from "./internal/generate_random_coupon";
import { prepare_random_coupon } from "./internal/prepare_random_coupon";

export const test_api_hub_coupon_store_of_seller = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const generate =
    (direction: "include" | "exclude") =>
    (types: IHubCouponCriteria.Type[]): Promise<IHubCoupon> =>
      generate_random_coupon({
        direction,
        customer: null,
        sale,
        types,
        create: (input) =>
          HubApi.functional.hub.sellers.coupons.create(pool.seller, input),
        prepare: (criterias) => prepare_random_coupon({ criterias }),
      });

  const subsets: IHubCouponCriteria.Type[][] = ArrayUtil.subsets(
    typia.misc
      .literals<IHubCouponCriteria.Type>()
      .filter((t) => t.length !== 0),
  );
  const possible: IHubCouponCriteria.Type[][] = subsets.filter((row) =>
    row.some((type) => type === "sale" || type === "seller"),
  );
  const impossible: IHubCouponCriteria.Type[][] = subsets.filter((row) =>
    row.every((type) => type !== "sale" && type !== "seller"),
  );

  // TRY POSSIBLES
  const couponList: IHubCoupon[] = await ArrayUtil.asyncMap(possible)(
    generate("include"),
  );
  await ArrayUtil.asyncMap(couponList)((c) =>
    HubApi.functional.hub.admins.coupons.destroy(pool.admin, c.id),
  );

  // TRY IMPOSSIBLES
  await ArrayUtil.asyncForEach(impossible)((types) =>
    TestValidator.httpError("include-not-allowed")(403)(() =>
      generate("include")(types),
    ),
  );
  await ArrayUtil.asyncForEach(possible)((types) =>
    TestValidator.httpError("exclude-not-allowed")(403)(() =>
      generate("exclude")(types),
    ),
  );
};
