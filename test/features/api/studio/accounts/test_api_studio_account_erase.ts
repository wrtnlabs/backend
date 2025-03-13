import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";

export const test_api_studio_account_erase = async (pool: ConnectionPool) => {
  await test_api_hub_customer_join(pool);

  const account: IStudioAccount = await generate_random_account(pool);
  await HubApi.functional.studio.customers.accounts.erase(
    pool.customer,
    account.id,
  );

  await TestValidator.httpError("readById")(404)(() =>
    HubApi.functional.studio.customers.accounts.at(pool.customer, account.id),
  );
  await TestValidator.httpError("readByCode")(404)(() =>
    HubApi.functional.studio.customers.accounts.get(
      pool.customer,
      account.code,
    ),
  );
};
