import { TestValidator } from "@nestia/e2e";
import { sleep_until } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { ActorPath } from "@wrtnlabs/os-api/lib/typings/ActorPath";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_coupon } from "./internal/generate_random_coupon";
import { prepare_random_coupon } from "./internal/prepare_random_coupon";

export const test_api_hub_coupon_closed_at = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  const closed_at: Date = new Date(Date.now() + 5_000);
  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const coupon: IHubCoupon = await generate_random_coupon({
    types: [],
    direction: "include",
    customer: null,
    sale,
    create: (input) =>
      HubApi.functional.hub.admins.coupons.create(pool.admin, input),
    prepare: (criterias) =>
      prepare_random_coupon({
        ...criterias,
        opened_at: new Date().toISOString(),
        closed_at: closed_at.toISOString(),
      }),
  });

  const error: Error | null = await TestValidator.proceed(async () => {
    const validate = async (path: ActorPath, visible: boolean) => {
      const connection: HubApi.IConnection =
        path === "admins"
          ? pool.admin
          : path === "customers"
            ? pool.customer
            : pool.seller;
      const page: IPage<IHubCoupon> = await HubApi.functional.hub[
        path
      ].coupons.index(connection, {
        sort: ["-coupon.created_at"],
        limit: 1,
      });
      TestValidator.equals(`visible -${path}`)(visible)(
        coupon.id === page.data[0]?.id,
      );

      const read = async () => {
        await HubApi.functional.hub[path].coupons.at(connection, coupon.id);
      };
      if (visible) await read();
      else await TestValidator.httpError("gone")(410)(read);
    };
    await validate("admins", true);
    await validate("customers", true);

    await sleep_until(closed_at);
    await validate("admins", true);
    await validate("customers", false);
  });
  if (error) throw error;
};
