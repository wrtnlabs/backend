import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";

export const test_api_studio_account_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  await ArrayUtil.asyncRepeat(REPEAT)(async () => {
    await test_api_hub_customer_join(pool);
    return generate_random_account(pool);
  });

  const validator = TestValidator.sort("account.code")<
    IStudioAccount.ISummary,
    IStudioAccount.IRequest.SortableColumns,
    IPage.Sort<IStudioAccount.IRequest.SortableColumns>
  >(async (input: IPage.Sort<IStudioAccount.IRequest.SortableColumns>) => {
    const page: IPage<IStudioAccount.ISummary> =
      await HubApi.functional.studio.customers.accounts.index(pool.customer, {
        sort: input,
        limit: REPEAT,
      });
    return page.data;
  });

  const components = [
    validator("account.code")(GaffComparator.strings((a) => a.code)),
    validator("account.created_at")(GaffComparator.dates((a) => a.created_at)),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};

const REPEAT = 25;
