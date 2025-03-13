import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseTeam } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeam";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";
import { generate_random_enterprise_team } from "./internal/generate_random_enterprise_team";

export const test_api_studio_enterprise_team_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);

  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: RandomGenerator.alphabets(8),
  });
  await ArrayUtil.asyncRepeat(REPEAT)(() =>
    generate_random_enterprise_team(pool, enterprise),
  );

  const total: IPage<IStudioEnterpriseTeam.ISummary> =
    await HubApi.functional.studio.customers.enterprises.teams.index(
      pool.customer,
      enterprise.account.code,
      {
        limit: REPEAT,
        sort: ["-team.created_at"],
      },
    );

  const validator = TestValidator.search("teams.index")(
    async (input: IStudioEnterpriseTeam.IRequest.ISearch) => {
      const page: IPage<IStudioEnterpriseTeam.ISummary> =
        await HubApi.functional.studio.customers.enterprises.teams.index(
          pool.customer,
          enterprise.account.code,
          {
            search: input,
            limit: total.data.length,
            sort: ["-team.created_at"],
          },
        );
      return page.data;
    },
  )(total.data, 4);

  await validator({
    fields: ["code"],
    values: (team) => [team.code],
    request: ([code]) => ({ code }),
    filter: (team, [code]) =>
      team.code.toLowerCase().includes(code.toLowerCase()),
  });
  await validator({
    fields: ["name"],
    values: (team) => [team.name],
    request: ([name]) => ({ name }),
    filter: (team, [name]) =>
      team.name.toLowerCase().includes(name.toLowerCase()),
  });
};
const REPEAT = 25;
