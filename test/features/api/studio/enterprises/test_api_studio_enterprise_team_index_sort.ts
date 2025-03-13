import {
  ArrayUtil,
  GaffComparator,
  RandomGenerator,
  TestValidator,
} from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseTeam } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeam";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";
import { generate_random_enterprise_team } from "./internal/generate_random_enterprise_team";

export const test_api_studio_enterprise_team_index_sort = async (
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

  const validator = TestValidator.sort("teams.index")<
    IStudioEnterpriseTeam.ISummary,
    IStudioEnterpriseTeam.IRequest.SortableColumns,
    IPage.Sort<IStudioEnterpriseTeam.IRequest.SortableColumns>
  >(async (
    input: IPage.Sort<IStudioEnterpriseTeam.IRequest.SortableColumns>,
  ) => {
    const page: IPage<IStudioEnterpriseTeam.ISummary> =
      await HubApi.functional.studio.customers.enterprises.teams.index(
        pool.customer,
        enterprise.account.code,
        {
          limit: REPEAT,
          sort: input,
        },
      );
    return page.data;
  });

  const components = [
    validator("team.code")(GaffComparator.strings((x) => x.code)),
    validator("team.name")(GaffComparator.strings((x) => x.name)),
    validator("team.created_at")(GaffComparator.dates((x) => x.created_at)),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};
const REPEAT = 25;
