import { ArrayUtil } from "@nestia/e2e";
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

export const test_api_hub_coupon_store = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const coupons: IHubCoupon[][] = await ArrayUtil.asyncMap(
    ArrayUtil.subsets(
      typia.misc
        .literals<IHubCouponCriteria.Type>()
        .filter((t) => t.length !== 0),
    ),
  )((types) =>
    ArrayUtil.asyncMap(["include", "exclude"] as const)((direction) =>
      generate_random_coupon({
        customer: null,
        direction,
        sale,
        types,
        create: (input) =>
          HubApi.functional.hub.admins.coupons.create(pool.admin, input),
        prepare: (criterias) => prepare_random_coupon({ criterias }),
      }),
    ),
  );
  await ArrayUtil.asyncMap(coupons.flat())((c) =>
    HubApi.functional.hub.admins.coupons.destroy(pool.admin, c.id),
  );
};
