import { RandomGenerator, TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
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

export const test_api_studio_enterprise_team_companion_create = async (
  pool: ConnectionPool,
): Promise<void> => {
  const { member: managerEmployee } = await test_api_hub_customer_join(pool);
  const { member: ownerEmployee } = await test_api_hub_customer_join(pool);

  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: RandomGenerator.alphabets(8),
  });
  const team: IStudioEnterpriseTeam = await generate_random_enterprise_team(
    pool,
    enterprise,
  );
  await generate_random_enterprise_employee(
    pool,
    enterprise,
    managerEmployee,
    "manager",
    {
      manager: ownerEmployee,
    },
  );

  const participate = partnership({ pool, enterprise, manager: ownerEmployee });
  const executor = companionship({ pool, enterprise, team });

  // MANAGER AND OWNER OF ENTERPRISE CAN ASSIGN EVERY ROLES
  for (const actor of [managerEmployee, ownerEmployee])
    for (const role of typia.misc.literals<IStudioEnterpriseTeamCompanion.Role>())
      await executor({
        manager: actor,
        employee: await participate(),
        role,
      });

  // CHIEF OF TEAM CAN DO EVERYTHING
  const chief: IStudioEnterpriseTeamCompanion = await executor({
    manager: ownerEmployee,
    employee: await participate(),
    role: "chief",
  });
  for (const role of typia.misc.literals<IStudioEnterpriseTeamCompanion.Role>())
    await executor({
      manager: chief.employee,
      employee: await participate(),
      role,
    });

  // MANAGER OF TEAM CAN ASSIGN ONLY MEMBER AND OBSERVER
  const manager: IStudioEnterpriseTeamCompanion = await executor({
    manager: ownerEmployee,
    employee: await participate(),
    role: "manager",
  });
  for (const role of ["member", "observer"] as const)
    await executor({
      manager: manager.employee,
      employee: await participate(),
      role,
    });
  for (const role of ["chief", "manager"] as const)
    await TestValidator.httpError("manager can't assign chief and manager")(
      403,
    )(async () =>
      executor({
        manager: manager.employee,
        employee: await participate(),
        role,
      }),
    );

  // MEMBER AND OBSERVER CAN'T DO ANYTHING
  const member: IStudioEnterpriseTeamCompanion = await executor({
    manager: ownerEmployee,
    employee: await participate(),
    role: "member",
  });
  const observer: IStudioEnterpriseTeamCompanion = await executor({
    manager: ownerEmployee,
    employee: await participate(),
    role: "observer",
  });
  for (const actor of [member, observer])
    for (const role of typia.misc.literals<IStudioEnterpriseTeamCompanion.Role>())
      await TestValidator.httpError(
        "member and observer can't assign anything",
      )(403)(async () =>
        executor({
          manager: actor.employee,
          employee: await participate(),
          role,
        }),
      );
};

const companionship =
  (asset: {
    pool: ConnectionPool;
    enterprise: IStudioEnterprise;
    team: IStudioEnterpriseTeam;
  }) =>
  async (props: {
    manager: IHubMember | IStudioEnterpriseEmployee;
    employee: IStudioEnterpriseEmployee;
    role: IStudioEnterpriseTeamCompanion.Role;
  }): Promise<IStudioEnterpriseTeamCompanion> => {
    await login(
      asset.pool,
      props.manager.type === "member" ? props.manager : props.manager.member,
    );

    const companion: IStudioEnterpriseTeamCompanion =
      await generate_random_enterprise_team_companion(
        asset.pool,
        asset.enterprise,
        asset.team,
        props.employee,
        props.role,
      );

    await login(asset.pool, props.employee.member);
    const read: IStudioEnterpriseTeamCompanion =
      await HubApi.functional.studio.customers.enterprises.teams.companions.at(
        asset.pool.customer,
        asset.enterprise.account.code,
        asset.team.code,
        companion.id,
      );
    TestValidator.equals("read")(companion)(read);
    return companion;
  };

const partnership =
  (props: {
    pool: ConnectionPool;
    manager: IHubMember;
    enterprise: IStudioEnterprise;
  }) =>
  async (): Promise<IStudioEnterpriseEmployee> => {
    const { member } = await test_api_hub_customer_join(props.pool);
    await login(props.pool, props.manager);

    const employee: IStudioEnterpriseEmployee =
      await generate_random_enterprise_employee(
        props.pool,
        props.enterprise,
        member,
        "member",
        {
          manager: props.manager,
        },
      );
    return employee;
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
