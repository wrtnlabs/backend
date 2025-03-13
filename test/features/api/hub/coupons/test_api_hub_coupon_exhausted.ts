import { ArrayUtil, TestValidator } from "@nestia/e2e";

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

export const test_api_hub_coupon_exhausted = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

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
        restriction: {
          volume: 4,
          volume_per_citizen: null,
        },
      }),
  });

  const error: Error | null = await TestValidator.proceed(async () => {
    const validate = async (
      path: ActorPath,
      visible: boolean,
      extra?: Partial<IHubCoupon.IRequest>,
    ) => {
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
        ...(extra ?? {}),
      });
      TestValidator.equals("visible")(visible)(coupon.id === page.data[0]?.id);
    };
    const ticketing = async () => {
      await HubApi.functional.hub.customers.coupons.tickets.create(
        pool.customer,
        {
          coupon_id: coupon.id,
        },
      );
    };

    await validate("admins", true);
    await validate("customers", true);

    await ArrayUtil.asyncRepeat(4)(ticketing);
    await TestValidator.httpError("ticketing to exhausted")(410)(ticketing);

    await validate("admins", true);
    await validate("customers", false);
  });
  await HubApi.functional.hub.admins.coupons.destroy(pool.admin, coupon.id);
  if (error) throw error;
};
