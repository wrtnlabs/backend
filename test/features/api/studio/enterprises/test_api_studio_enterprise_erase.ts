import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../hub/actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";

export const test_api_studio_enterprise_erase = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  await test_api_hub_admin_login(pool);

  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: RandomGenerator.alphabets(8),
  });
  await HubApi.functional.studio.customers.enterprises.erase(
    pool.customer,
    enterprise.id,
  );

  await TestValidator.httpError("access by id")(404)(() =>
    HubApi.functional.studio.customers.enterprises.at(
      pool.customer,
      enterprise.id,
    ),
  );
  await TestValidator.httpError("access by code")(404)(() =>
    HubApi.functional.studio.customers.enterprises.get(
      pool.customer,
      enterprise.account.code,
    ),
  );

  const total: IPage<IStudioEnterprise.ISummary> =
    await HubApi.functional.studio.admins.enterprises.index(pool.admin, {
      limit: 10,
      search: {
        account: enterprise.account.code,
      },
    });
  TestValidator.equals("index")(total.pagination.records)(0);

  await TestValidator.httpError("account access by code")(404)(() =>
    HubApi.functional.studio.customers.accounts.get(
      pool.customer,
      enterprise.account.code,
    ),
  );

  await TestValidator.httpError("account access by id")(404)(() =>
    HubApi.functional.studio.customers.accounts.at(
      pool.customer,
      enterprise.account.id,
    ),
  );

  // @todo -> employee, team, repository, release 등에의 접근 시도 필요
};
