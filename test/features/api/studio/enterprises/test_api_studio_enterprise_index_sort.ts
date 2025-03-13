import {
  ArrayUtil,
  GaffComparator,
  RandomGenerator,
  TestValidator,
} from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../hub/actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";

export const test_api_studio_enterprise_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  await test_api_hub_admin_login(pool);

  await ArrayUtil.asyncRepeat(REPEAT)(() =>
    generate_random_enterprise(pool, {
      migrate: false,
      account: RandomGenerator.alphabets(8),
    }),
  );

  const validator = TestValidator.sort("enterprises.index")<
    IStudioEnterprise.ISummary,
    IStudioEnterprise.IRequest.SortableColumns,
    IPage.Sort<IStudioEnterprise.IRequest.SortableColumns>
  >(async (input) => {
    const page: IPage<IStudioEnterprise.ISummary> =
      await HubApi.functional.studio.admins.enterprises.index(pool.admin, {
        limit: REPEAT,
        sort: input,
      });
    return page.data;
  });

  const components = [
    validator("account.code")(GaffComparator.strings((e) => e.account.code)),
    validator("enterprise.name")(GaffComparator.strings((e) => e.name)),
    validator("enterprise.created_at")(
      GaffComparator.dates((e) => e.created_at),
    ),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};

const REPEAT = 25;
