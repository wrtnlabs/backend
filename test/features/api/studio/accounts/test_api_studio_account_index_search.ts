import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "../enterprises/internal/generate_random_enterprise";
import { generate_random_account } from "./internal/generate_random_account";

export const test_api_studio_account_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await ArrayUtil.asyncRepeat(REPEAT)(async () => {
    await test_api_hub_customer_join(pool);
    await generate_random_account(pool);

    if (Math.random() < 0.5)
      await generate_random_enterprise(pool, {
        migrate: true,
        new_account_for_customer: null,
      });
  });

  const total: IPage<IStudioAccount.ISummary> =
    await HubApi.functional.studio.customers.accounts.index(pool.customer, {
      sort: ["-account.created_at"],
      limit: REPEAT,
    });

  const validator = TestValidator.search("accounts.index")(
    async (input: IStudioAccount.IRequest.ISearch) => {
      const page: IPage<IStudioAccount.ISummary> =
        await HubApi.functional.studio.customers.accounts.index(pool.customer, {
          limit: total.data.length,
          search: input,
          sort: ["-account.created_at"],
        });
      return page.data;
    },
  )(total.data, 4);

  await validator({
    fields: ["type"],
    values: (account) => [account.owner.type],
    request: ([type]) => ({ type }),
    filter: (account, [type]) => account.owner.type === type,
  });
};

const REPEAT = 25;
