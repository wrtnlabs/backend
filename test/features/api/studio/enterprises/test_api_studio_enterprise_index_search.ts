import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../hub/actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";

export const test_api_studio_enterprise_index_search = async (
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

  const total: IPage<IStudioEnterprise.ISummary> =
    await HubApi.functional.studio.admins.enterprises.index(pool.admin, {
      limit: REPEAT,
      sort: ["-enterprise.created_at"],
    });

  const validator = TestValidator.search("enterprises.index")(
    async (input: IStudioEnterprise.IRequest.ISearch) => {
      const page: IPage<IStudioEnterprise.ISummary> =
        await HubApi.functional.studio.admins.enterprises.index(pool.admin, {
          search: input,
          limit: total.data.length,
          sort: ["-enterprise.created_at"],
        });
      return page.data;
    },
  )(total.data, 4);

  await validator({
    fields: ["account"],
    values: (ent) => [ent.account.code],
    request: ([account]) => ({ account }),
    filter: (ent, [account]) =>
      ent.account.code.toLowerCase().includes(account.toLowerCase()),
  });
  await validator({
    fields: ["name"],
    values: (ent) => [ent.name],
    request: ([name]) => ({ name }),
    filter: (ent, [name]) =>
      ent.name.toLowerCase().includes(name.toLowerCase()),
  });
};

const REPEAT = 25;
