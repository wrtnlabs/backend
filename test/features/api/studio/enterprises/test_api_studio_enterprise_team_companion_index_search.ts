import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";
import { IStudioEnterpriseTeam } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeam";
import { IStudioEnterpriseTeamCompanion } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeamCompanion";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "../../hub/actors/test_api_hub_customer_create";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";
import { generate_random_enterprise_employee } from "./internal/generate_random_enterprise_employee";
import { generate_random_enterprise_team } from "./internal/generate_random_enterprise_team";
import { generate_random_enterprise_team_companion } from "./internal/generate_random_enterprise_team_companion";

export const test_api_studio_enterprise_team_companion_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  const { member: owner } = await test_api_hub_customer_join(pool);

  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: RandomGenerator.alphabets(8),
  });
  const team: IStudioEnterpriseTeam = await generate_random_enterprise_team(
    pool,
    enterprise,
  );
  await ArrayUtil.asyncRepeat(REPEAT)(() =>
    create({ pool, enterprise, team, owner })(
      RandomGenerator.pick(
        typia.misc.literals<IStudioEnterpriseTeamCompanion.Role>(),
      ),
    ),
  );

  const total: IPage<IStudioEnterpriseTeamCompanion.ISummary> =
    await HubApi.functional.studio.customers.enterprises.teams.companions.index(
      pool.customer,
      enterprise.account.code,
      team.code,
      {
        limit: REPEAT,
        sort: ["-companion.created_at"],
      },
    );

  const validator = TestValidator.search("companions.index")(
    async (input: IStudioEnterpriseTeamCompanion.IRequest.ISearch) => {
      const page: IPage<IStudioEnterpriseTeamCompanion.ISummary> =
        await HubApi.functional.studio.customers.enterprises.teams.companions.index(
          pool.customer,
          enterprise.account.code,
          team.code,
          {
            search: input,
            limit: REPEAT,
            sort: ["-companion.created_at"],
          },
        );
      return page.data;
    },
  )(total.data, 4);

  await validator({
    fields: ["roles"],
    values: (c) => [c.role],
    filter: (c, roles) => roles.includes(c.role),
    request: (roles) => ({ roles }),
  });
  await validator({
    fields: ["from", "to"],
    values: (c) => [
      new Date(new Date(c.created_at).getTime() - 500).toISOString(),
      new Date(new Date(c.created_at).getTime() + 500).toISOString(),
    ],
    filter: (c, [from, to]) =>
      new Date(c.created_at).getTime() >= new Date(from).getTime() &&
      new Date(c.created_at).getTime() <= new Date(to).getTime(),
    request: ([from, to]) => ({ from, to }),
  });
};

const create =
  (asset: {
    pool: ConnectionPool;
    enterprise: IStudioEnterprise;
    team: IStudioEnterpriseTeam;
    owner: IHubMember;
  }) =>
  async (
    role: IStudioEnterpriseTeamCompanion.Role,
  ): Promise<IStudioEnterpriseTeamCompanion> => {
    const { member } = await test_api_hub_customer_join(asset.pool);
    await login(asset.pool, asset.owner);

    const employee: IStudioEnterpriseEmployee =
      await generate_random_enterprise_employee(
        asset.pool,
        asset.enterprise,
        member,
        "member",
        {
          manager: asset.owner,
        },
      );
    return generate_random_enterprise_team_companion(
      asset.pool,
      asset.enterprise,
      asset.team,
      employee,
      role,
    );
  };

const login = async (
  pool: ConnectionPool,
  member: IHubMember,
): Promise<void> => {
  await test_api_hub_customer_create(pool);
  await HubApi.functional.hub.customers.members.login(pool.customer, {
    email: member.emails[0].value,
    password: TestGlobal.PASSWORD,
  });
};

const REPEAT = 25;
