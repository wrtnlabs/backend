import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioAccountSecret } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecret";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";
import { generate_random_account_secret } from "./internal/generate_random_account_secret";

export const test_api_studio_account_secret_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool);
  await ArrayUtil.asyncRepeat(REPEAT)(() =>
    generate_random_account_secret(pool, account),
  );

  const validator = TestValidator.sort("secrets")<
    IStudioAccountSecret.ISummary,
    IStudioAccountSecret.IRequest.SortableColumns,
    IPage.Sort<IStudioAccountSecret.IRequest.SortableColumns>
  >(async (
    input: IPage.Sort<IStudioAccountSecret.IRequest.SortableColumns>,
  ) => {
    const page: IPage<IStudioAccountSecret.ISummary> =
      await HubApi.functional.studio.customers.accounts.secrets.index(
        pool.customer,
        account.code,
        {
          sort: input,
          limit: REPEAT,
        },
      );
    return page.data;
  });

  const components = [
    validator("secret.key")(GaffComparator.strings((a) => a.key)),
    validator("secret.title")(GaffComparator.strings((a) => a.title ?? "")),
    validator("secret.created_at")(GaffComparator.dates((a) => a.created_at)),
    validator("secret.updated_at")(GaffComparator.dates((a) => a.updated_at)),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};

const REPEAT = 25;
