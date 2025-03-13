import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioAccountSecret } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecret";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";

export const test_api_studio_account_secret_emplace = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool);
  const created: IStudioAccountSecret =
    await HubApi.functional.studio.customers.accounts.secrets.emplace(
      pool.customer,
      account.code,
      {
        key: "something",
        values: [
          {
            code: "The first code",
            value: "The first value",
            expired_at: null,
            scopes: ["A", "B", "C"],
          },
        ],
        title: "The first title",
        description: "The first description",
      },
    );
  TestValidator.equals("created")({
    key: "something",
    title: "The first title",
    description: "The first description",
    values: [
      {
        code: "The first code",
        value: "The first value",
        expired_at: null,
        scopes: ["A", "B", "C"],
      },
    ],
  })(created as any);

  const updated: IStudioAccountSecret =
    await HubApi.functional.studio.customers.accounts.secrets.emplace(
      pool.customer,
      account.code,
      {
        key: "something",
        values: [
          {
            code: "The second code",
            value: "The second value",
            expired_at: null,
            scopes: ["a", "b", "c", "d"],
          },
          {
            code: "The first code",
            value: "The first value but modified",
            expired_at: null,
            scopes: ["C", "D"],
          },
        ],
        title: "The second title",
        description: "The second description",
      },
    );
  TestValidator.equals("updated")({
    key: "something",
    title: "The second title",
    description: "The second description",
    values: [
      {
        code: "The first code",
        value: "The first value but modified",
        expired_at: null,
        scopes: ["A", "B", "C", "D"],
      },
      {
        code: "The second code",
        value: "The second value",
        expired_at: null,
        scopes: ["a", "b", "c", "d"],
      },
    ],
  })(updated as any);

  const read: IStudioAccountSecret =
    await HubApi.functional.studio.customers.accounts.secrets.at(
      pool.customer,
      account.code,
      created.id,
    );
  TestValidator.equals("read")(updated)(read);
};
