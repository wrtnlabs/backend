import { TestValidator } from "@nestia/e2e";
import HubApi from "@wrtnlabs/os-api";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import typia from "typia";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_admin_login } from "./test_api_hub_admin_login";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";

export const test_api_hub_admin_password_change = async (
  pool: ConnectionPool,
): Promise<void> => {
  const admin: IHubAdministrator.IInvert = await test_api_hub_admin_login(pool);
  const login = async (password: string) => {
    await test_api_hub_customer_create(pool, pool.admin);
    const authorized: IHubAdministrator.IInvert =
      await HubApi.functional.hub.admins.authenticate.login(pool.admin, {
        email: admin.member.emails[0].value,
        password,
      });
    return authorized;
  };

  const passed = await login(TestGlobal.PASSWORD);
  const first: IHubAdministrator.IInvert = await login(TestGlobal.PASSWORD);
  validate("login")(passed)(first);

  await HubApi.functional.hub.customers.authenticate.password.change(
    pool.admin,
    {
      oldbie: TestGlobal.PASSWORD,
      newbie: NEW_PASSWORD,
    },
  );
  const after: IHubAdministrator.IInvert = await login(NEW_PASSWORD);
  validate("after")(passed)(after);

  await HubApi.functional.hub.customers.authenticate.password.change(
    pool.admin,
    {
      oldbie: NEW_PASSWORD,
      newbie: TestGlobal.PASSWORD,
    },
  );
  const again: IHubAdministrator.IInvert = await login(TestGlobal.PASSWORD);
  validate("again")(passed)(again);
};

const validate =
  (title: string) =>
  (x: IHubAdministrator.IInvert) =>
  (y: IHubAdministrator.IInvert) =>
    TestValidator.equals(title)(
      typia.misc.clone<Omit<IHubAdministrator, "customer">>(x),
    )(y);

const NEW_PASSWORD = "something";
