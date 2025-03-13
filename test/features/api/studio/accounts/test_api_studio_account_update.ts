import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";

export const test_api_studio_account_update = async (pool: ConnectionPool) => {
  await test_api_hub_customer_join(pool);

  const oldbie: string = RandomGenerator.alphabets(8);
  const newbie: string = RandomGenerator.alphabets(8);
  const account: IStudioAccount = await generate_random_account(pool, {
    code: oldbie,
  });
  await HubApi.functional.studio.customers.accounts.update(
    pool.customer,
    account.id,
    {
      code: newbie,
    },
  );

  const read: IStudioAccount =
    await HubApi.functional.studio.customers.accounts.get(
      pool.customer,
      newbie,
    );
  TestValidator.equals("read")(newbie)(read.code);
  await TestValidator.httpError("get")(404)(() =>
    HubApi.functional.studio.customers.accounts.get(pool.customer, oldbie),
  );
};
