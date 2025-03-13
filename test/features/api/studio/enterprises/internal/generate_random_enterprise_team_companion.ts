import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";
import { IStudioEnterpriseTeam } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeam";
import { IStudioEnterpriseTeamCompanion } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeamCompanion";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_enterprise_team_companion = async (
  pool: ConnectionPool,
  enterprise: IStudioEnterprise,
  team: IStudioEnterpriseTeam,
  employee: IStudioEnterpriseEmployee,
  role: IStudioEnterpriseTeamCompanion.Role,
): Promise<IStudioEnterpriseTeamCompanion> => {
  const companion: IStudioEnterpriseTeamCompanion =
    await HubApi.functional.studio.customers.enterprises.teams.companions.create(
      pool.customer,
      enterprise.account.code,
      team.code,
      {
        employee_id: employee.id,
        role,
      },
    );
  return companion;
};
