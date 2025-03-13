import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";
import { randint } from "tstl";
import typia from "typia";

import api from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubCouponCriteria } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteria";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_coupon } from "./internal/generate_random_coupon";
import { prepare_random_coupon } from "./internal/prepare_random_coupon";

export const test_api_hub_coupon_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  // AUTHORIZE USERS
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  // GENERATE COUPONS
  const saleList: IHubSale[] = await ArrayUtil.asyncRepeat(10)(() =>
    generate_random_sale(pool, "approved"),
  );
  const generator = (sale: IHubSale) => (types: IHubCouponCriteria.Type[]) =>
    generate_random_coupon({
      direction: "include",
      customer: null,
      sale,
      types,
      create: (input) =>
        api.functional.hub.admins.coupons.create(pool.admin, input),
      prepare: (criterias) =>
        prepare_random_coupon({
          criterias,
          opened_at: new Date(Date.now() + randint(-5 * DAY, 0)).toISOString(),
          closed_at: new Date(
            Date.now() + randint(2 * DAY, 7 * DAY),
          ).toISOString(),
          restriction: {
            expired_at: null,
            expired_in: randint(7, 28),
          },
        }),
    });

  const coupons: IHubCoupon[] = ArrayUtil.flat(
    await ArrayUtil.asyncMap(saleList)((sale) =>
      ArrayUtil.asyncMap(typia.misc.literals<IHubCouponCriteria.Type>())(
        (type) => generator(sale)([type]),
      ),
    ),
  );

  // PREPARE VALIDATOR
  const validator = TestValidator.sort(
    "HubCouponsController() with sort options",
  )<
    IHubCoupon,
    IHubCoupon.IRequest.SortableColumns,
    IPage.Sort<IHubCoupon.IRequest.SortableColumns>
  >(async (sort) => {
    const page: IPage<IHubCoupon> =
      await api.functional.hub.admins.coupons.index(pool.admin, {
        limit: coupons.length,
        sort,
      });
    return page.data;
  });

  // LIST UP FIELDS TO SORT
  const components = [
    // VALUES
    validator("coupon.name")(GaffComparator.strings((x) => x.name)),
    validator("coupon.value")(
      GaffComparator.numbers((x) => [x.discount.value]),
    ),
    validator("coupon.unit")(GaffComparator.strings((x) => [x.discount.unit])),

    // TIMESTAMPS
    validator("coupon.created_at")(GaffComparator.dates((x) => x.created_at)),
    validator("coupon.opened_at")(
      GaffComparator.strings((x) => x.opened_at ?? "2999-12-31"),
    ),
    validator("coupon.closed_at")(
      GaffComparator.strings((x) => x.closed_at ?? "2999-12-31"),
    ),
    // validator("coupon.expired_at")(
    //   GaffComparator.strings(
    //     (x) =>
    //       x.restriction.expired_at ??
    //       (x.restriction.expired_in
    //         ? new Date(Date.now() + x.restriction.expired_in * DAY).toString()
    //         : "2999-12-31"),
    //   ),
    // ),
  ];

  // DO VALIDATE
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }

  // ERASED COUPONS
  for (const c of coupons)
    await api.functional.hub.admins.coupons.destroy(pool.admin, c.id);
};
const DAY = 1000 * 60 * 60 * 24;
