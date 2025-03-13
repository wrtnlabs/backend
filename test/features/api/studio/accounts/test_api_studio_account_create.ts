import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../hub/actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";

export const test_api_studio_account_create = async (pool: ConnectionPool) => {
  await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool, {
    code: code,
  });

  const readById: IStudioAccount =
    await HubApi.functional.studio.customers.accounts.at(
      pool.customer,
      account.id,
    );

  const readByCode: IStudioAccount =
    await HubApi.functional.studio.customers.accounts.get(
      pool.customer,
      account.code,
    );
  TestValidator.equals("readById")(account)(readById);
  TestValidator.equals("readByCode")(account)(readByCode);

  await test_api_hub_admin_login(pool);
  const readByIdForAdmin: IStudioAccount =
    await HubApi.functional.studio.admins.accounts.at(pool.admin, account.id);

  const readByCodeForAdmin: IStudioAccount =
    await HubApi.functional.studio.admins.accounts.get(
      pool.admin,
      account.code,
    );
  TestValidator.equals("readByIdForAdmin")(account)(readByIdForAdmin);
  TestValidator.equals("readByCodeForAdmin")(account)(readByCodeForAdmin);

  const customer: IHubCustomer =
    await HubApi.functional.hub.customers.authenticate.get(pool.customer);
  TestValidator.equals("customer.member.account")(customer.member?.account)(
    account,
  );

  await TestValidator.httpError("Account record is unique")(409)(async () => {
    await generate_random_account(pool);
  });

  await test_api_hub_customer_join(pool);

  await TestValidator.httpError("Account code is unique")(409)(async () => {
    await generate_random_account(pool, {
      code: code,
    });
  });
};

const code = RandomGenerator.name();
