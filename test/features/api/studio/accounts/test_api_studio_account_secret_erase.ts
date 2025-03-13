import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioAccountSecret } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecret";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";
import { generate_random_account_secret } from "./internal/generate_random_account_secret";

export const test_api_studio_account_secret_erase = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool);
  const variable: IStudioAccountSecret = await generate_random_account_secret(
    pool,
    account,
  );

  await HubApi.functional.studio.customers.accounts.secrets.erase(
    pool.customer,
    account.code,
    variable.id,
  );

  await TestValidator.httpError("erased")(404)(() =>
    HubApi.functional.studio.customers.accounts.secrets.at(
      pool.customer,
      account.id,
      variable.id,
    ),
  );
};
