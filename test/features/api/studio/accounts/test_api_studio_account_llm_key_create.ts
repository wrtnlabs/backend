import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioAccountLlmKey } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountLlmKey";

import { StudioAccountLlmKeyProvider } from "../../../../../src/providers/studio/accounts/StudioAccountLlmKeyProvider";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";

export const test_api_studio_account_llm_key_create = async (
  pool: ConnectionPool,
): Promise<void> => {
  const customer: IHubCustomer = await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool);
  customer.member!.account = account;

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
  const page: IPage<IStudioAccountLlmKey> =
    await HubApi.functional.studio.customers.accounts.llm.keys.index(
      pool.customer,
      account.code,
      {
        limit: 10,
      },
    );
  TestValidator.equals("index")(page.data)([key]);

  const invert: IStudioAccountLlmKey.IEmplace =
    await StudioAccountLlmKeyProvider.invert({
      customer,
      account,
      code: "c9",
    });
  TestValidator.equals("invert")(invert)({
    code: "c9",
    provider: "openai",
    value: "v9",
  });
};
