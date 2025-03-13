import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseTeam } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeam";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_enterprise_team = async (
  pool: ConnectionPool,
  enterprise: IStudioEnterprise,
  input?: IStudioEnterpriseTeam.ICreate,
): Promise<IStudioEnterpriseTeam> => {
  const team: IStudioEnterpriseTeam =
    await HubApi.functional.studio.customers.enterprises.teams.create(
      pool.customer,
      enterprise.account.code,
      {
        code: RandomGenerator.alphabets(8),
        name: RandomGenerator.name(3),
        ...input,
      },
    );
  return team;
};
