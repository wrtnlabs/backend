import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioAccountSecretValue } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecretValue";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "./internal/generate_random_account";
import { generate_random_account_secret } from "./internal/generate_random_account_secret";

export const test_api_studio_account_secret_value_index_sort = async (
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

  const validator = TestValidator.sort("values")<
    IStudioAccountSecretValue.IInvertSummary,
    IStudioAccountSecretValue.IRequest.SortableColumns,
    IPage.Sort<IStudioAccountSecretValue.IRequest.SortableColumns>
  >(async (
    input: IPage.Sort<IStudioAccountSecretValue.IRequest.SortableColumns>,
  ) => {
    const page: IPage<IStudioAccountSecretValue.IInvertSummary> =
      await HubApi.functional.studio.customers.accounts.secrets.values.index(
        pool.customer,
        account.code,
        {
          sort: input,
          limit: 100,
        },
      );
    TestValidator.equals("number of records")(REPEAT * REPEAT)(
      page.data.length,
    );
    return page.data;
  });

  const components = [
    validator("value.code")(GaffComparator.strings((a) => a.code)),
    validator("value.created_at")(GaffComparator.dates((a) => a.created_at)),
    validator("value.updated_at")(GaffComparator.dates((a) => a.updated_at)),
    validator("value.expired_at")(
      GaffComparator.dates((a) => a.expired_at ?? "9999-12-31"),
    ),
    validator("secret.key")(GaffComparator.strings((a) => a.secret.key)),
    validator("secret.title")(
      GaffComparator.strings((a) => a.secret.title ?? ""),
    ),
    validator("secret.created_at")(
      GaffComparator.dates((a) => a.secret.created_at),
    ),
    validator("secret.updated_at")(
      GaffComparator.dates((a) => a.secret.updated_at),
    ),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};
const REPEAT = 5;
