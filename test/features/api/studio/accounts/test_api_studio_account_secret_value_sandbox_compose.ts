import { TestValidator } from "@nestia/e2e";
import { IChatGptSchema } from "@samchon/openapi";
import { v4 } from "uuid";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioAccountSecret } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecret";
import { IStudioAccountSecretValueSandbox } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecretValueSandbox";

import { StudioAccountSecretValueSandboxProvider } from "../../../../../src/providers/studio/accounts/StudioAccountSecretValueSandboxProvider";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";

export const test_api_studio_account_secret_value_sandbox_compose = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool);
  const secret: IStudioAccountSecret =
    await HubApi.functional.studio.customers.accounts.secrets.create(
      pool.customer,
      account.code,
      {
        key: "google",
        values: [
          {
            code: "google",
            value: "Jaxtyn Token",
            scopes: ["https://mail.google.com/"],
            expired_at: null,
          },
        ],
        title: null,
        description: null,
      },
    );

  const schema: IChatGptSchema.IObject = {
    type: "object",
    properties: {
      identifiers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            secret: {
              type: "string",
              "x-wrtn-secret-key": "google",
              "x-wrtn-secret-scopes": ["mail.google.com"],
            },
          },
          required: ["secret"],
        },
      },
    },
    required: ["identifiers"],
  };
  const input = {
    identifiers: [
      {
        secret: secret.values[0].id,
      },
    ],
  };
  await StudioAccountSecretValueSandboxProvider.encodeLlmSchema({
    source: {
      table: "something",
      id: v4(),
    },
    $defs: {},
    schema,
    input,
  });
  TestValidator.predicate("changed")(
    () => input.identifiers[0].secret !== secret.values[0].id,
  );

  const sandbox: IStudioAccountSecretValueSandbox =
    await HubApi.functional.studio.customers.accounts.secrets.values.sandboxes.at(
      pool.customer,
      input.identifiers[0].secret,
    );
  TestValidator.equals("sandbox.value")(sandbox.value)(secret.values[0].value);
};
