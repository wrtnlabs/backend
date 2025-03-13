import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioAccountSecretValue } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecretValue";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";
import { generate_random_account_secret } from "./internal/generate_random_account_secret";

export const test_api_studio_account_secret_value_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool);
  await ArrayUtil.asyncRepeat(REPEAT)((i) =>
    generate_random_account_secret(pool, account, {
      key: `something-${i}`,
      values: ArrayUtil.repeat(REPEAT)((j) => ({
        code: `nothing-${j}`,
        value: `everything-${i}-${j}`,
        scopes: [],
        expired_at: null,
      })),
    }),
  );

  const total: IPage<IStudioAccountSecretValue.IInvertSummary> =
    await HubApi.functional.studio.customers.accounts.secrets.values.index(
      pool.customer,
      account.code,
      {
        limit: 100,
      },
    );
  TestValidator.equals("number of records")(REPEAT * REPEAT)(total.data.length);

  const validator = TestValidator.search("accounts.index")(
    async (input: IStudioAccountSecretValue.IRequest.ISearch) => {
      const page: IPage<IStudioAccountSecretValue.IInvertSummary> =
        await HubApi.functional.studio.customers.accounts.secrets.values.index(
          pool.customer,
          account.code,
          {
            limit: total.data.length,
            search: input,
            sort: ["-secret.created_at"],
          },
        );
      return page.data;
    },
  )(total.data, 4);

  await validator({
    fields: ["code"],
    values: (value) => [value.code],
    request: ([code]) => ({ code }),
    filter: (value, [code]) => value.code.includes(code),
  });
  await validator({
    fields: ["secret.key"],
    values: (value) => [value.secret.key],
    request: ([key]) => ({ secret: { key } }),
    filter: (value, [key]) => value.secret.key.includes(key),
  });
  await validator({
    fields: ["secret.title"],
    values: (key) => [key.secret.title ?? ""],
    request: ([title]) => ({ secret: { title } }),
    filter: (value, [title]) => !!value.secret.title?.includes(title),
  });
};
const REPEAT = 5;
