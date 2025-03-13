import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioAccountSecret } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecret";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";
import { generate_random_account_secret } from "./internal/generate_random_account_secret";

export const test_api_studio_account_secret_update = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool);
  const variable: IStudioAccountSecret = await generate_random_account_secret(
    pool,
    account,
  );
  const value: string = RandomGenerator.name(8);

  await HubApi.functional.studio.customers.accounts.secrets.update(
    pool.customer,
    account.code,
    variable.id,
    {
      values: [
        {
          code: "something",
          value,
          expired_at: null,
          scopes: ["a", "b", "c"],
        },
      ],
    },
  );

  const read: IStudioAccountSecret =
    await HubApi.functional.studio.customers.accounts.secrets.at(
      pool.customer,
      account.code,
      variable.id,
    );
  TestValidator.equals("updated")(value)(read.values[0].value);
};
