import { TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";
import { test_api_hub_seller_join } from "./test_api_hub_seller_join";

export const test_api_hub_seller_login = async (
  pool: ConnectionPool,
): Promise<void> => {
  const joined: IHubSeller.IInvert = await test_api_hub_seller_join(pool);

  const login = async (password: string) => {
    await test_api_hub_customer_create(pool, pool.seller);
    const authorized: IHubSeller.IInvert =
      await HubApi.functional.hub.sellers.authenticate.login(pool.seller, {
        email: joined.member.emails[0].value,
        password,
      });
    return authorized;
  };

  const passed: IHubSeller.IInvert = await login(TestGlobal.PASSWORD);
  TestValidator.equals("passed")(
    typia.misc.clone<Omit<IHubSeller.IInvert, "customer">>(joined),
  )(passed);

  await TestValidator.httpError("wrong password")(403)(() =>
    login(FAILED_PASSWORD),
  );
};

const FAILED_PASSWORD = "@password";
