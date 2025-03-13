import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioAccountLlmKey } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountLlmKey";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";

export const test_api_studio_account_llm_key_erase = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);

  const account: IStudioAccount = await generate_random_account(pool);
  const key: IStudioAccountLlmKey =
    await HubApi.functional.studio.customers.accounts.llm.keys.emplace(
      pool.customer,
      account.code,
      {
        code: `c9`,
        provider: "openai",
        value: `v9`,
      },
    );
  await HubApi.functional.studio.customers.accounts.llm.keys.erase(
    pool.customer,
    account.code,
    key.id,
  );

  const page: IPage<IStudioAccountLlmKey> =
    await HubApi.functional.studio.customers.accounts.llm.keys.index(
      pool.customer,
      account.code,
      {
        limit: 10,
      },
    );
  TestValidator.equals("index")(page.data)([]);
};
