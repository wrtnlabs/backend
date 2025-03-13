import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioAccountSecret } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecret";
import { IStudioAccountSecretValue } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecretValue";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";
import { generate_random_account_secret } from "./internal/generate_random_account_secret";

export const test_api_studio_account_secret_value_create = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);

  const account: IStudioAccount = await generate_random_account(pool);
  const secret: IStudioAccountSecret = await generate_random_account_secret(
    pool,
    account,
  );
  const value: IStudioAccountSecretValue =
    await HubApi.functional.studio.customers.accounts.secrets.values.create(
      pool.customer,
      account.code,
      secret.id,
      {
        code: "something2",
        value: "nothing2",
        scopes: ["a"],
        expired_at: null,
      },
    );

  const read: IStudioAccountSecret =
    await HubApi.functional.studio.customers.accounts.secrets.at(
      pool.customer,
      account.code,
      secret.id,
    );
  TestValidator.equals("created")({
    ...secret,
    values: [...secret.values, value],
  })(read);
};
