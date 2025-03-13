import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioAccountSecret } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecret";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";
import { generate_random_account_secret } from "./internal/generate_random_account_secret";

export const test_api_studio_account_secret_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool);
  await ArrayUtil.asyncRepeat(REPEAT)(() =>
    generate_random_account_secret(pool, account),
  );

  const total: IPage<IStudioAccountSecret.ISummary> =
    await HubApi.functional.studio.customers.accounts.secrets.index(
      pool.customer,
      account.code,
      {
        sort: ["-secret.created_at"],
        limit: REPEAT,
      },
    );

  const validator = TestValidator.search("accounts.index")(
    async (input: IStudioAccountSecret.IRequest.ISearch) => {
      const page: IPage<IStudioAccountSecret.ISummary> =
        await HubApi.functional.studio.customers.accounts.secrets.index(
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
    fields: ["key"],
    values: (variable) => [variable.key],
    request: ([key]) => ({ key }),
    filter: (variable, [key]) => variable.key.includes(key),
  });
  await validator({
    fields: ["title"],
    values: (variable) => [variable.title ?? ""],
    request: ([title]) => ({ title }),
    filter: (variable, [title]) => !!variable.title?.includes(title),
  });
};

const REPEAT = 25;
