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

export const test_api_studio_enterprise_team_companion_erase = async (
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
  const prepare = create({ pool, enterprise, team, owner: ownerEmployee });
  const executor = erase({ pool, enterprise, team, owner: ownerEmployee });

  // MANAGER AND OWNER OF ENTERPRISE CAN DO ANYTHING
  for (const actor of [managerEmployee, ownerEmployee])
    for (const role of typia.misc.literals<IStudioEnterpriseTeamCompanion.Role>())
      await executor({
        manager: actor,
        employee: await participate(),
        role,
      });

  // CHIEF OF TEAM ALSO CAN DO EVERYTHING
  const chief: IStudioEnterpriseTeamCompanion = await prepare({
    employee: await participate(),
    role: "chief",
  });
  for (const role of typia.misc.literals<IStudioEnterpriseTeamCompanion.Role>())
    await executor({
      manager: chief.employee,
      employee: await participate(),
      role,
    });

  // MANAGER OF TEAM CAN ERASE ONLY MEMBER AND OBSERVER
  const manager: IStudioEnterpriseTeamCompanion = await prepare({
    employee: await participate(),
    role: "manager",
  });
  for (const role of typia.misc.literals<IStudioEnterpriseTeamCompanion.Role>()) {
    const task = async () =>
      executor({
        manager: manager.employee,
        employee: await participate(),
        role: role,
      });
    if (role === "chief" || role === "manager")
      await TestValidator.httpError(
        "manager can't change or change to chief and manager",
      )(403)(task);
    else await task();
  }

  // MEMBER AND OBSERVER CAN'T DO ANYTHING
  const member: IStudioEnterpriseTeamCompanion = await prepare({
    employee: await participate(),
    role: "member",
  });
  const observer: IStudioEnterpriseTeamCompanion = await prepare({
    employee: await participate(),
    role: "observer",
  });
  for (const actor of [member, observer])
    for (const role of typia.misc.literals<IStudioEnterpriseTeamCompanion.Role>())
      await TestValidator.httpError("member and observer can't do anything")(
        403,
      )(async () =>
        executor({
          manager: actor.employee,
          employee: await participate(),
          role,
        }),
      );
};

const create =
  (asset: {
    pool: ConnectionPool;
    enterprise: IStudioEnterprise;
    team: IStudioEnterpriseTeam;
    owner: IHubMember;
  }) =>
  async (props: {
    employee: IStudioEnterpriseEmployee;
    role: IStudioEnterpriseTeamCompanion.Role;
  }) => {
    await login(asset.pool, asset.owner);
    return generate_random_enterprise_team_companion(
      asset.pool,
      asset.enterprise,
      asset.team,
      props.employee,
      props.role,
    );
  };

const erase =
  (asset: {
    pool: ConnectionPool;
    enterprise: IStudioEnterprise;
    team: IStudioEnterpriseTeam;
    owner: IHubMember;
  }) =>
  async (props: {
    manager: IHubMember | IStudioEnterpriseEmployee;
    employee: IStudioEnterpriseEmployee;
    role: IStudioEnterpriseTeamCompanion.Role;
  }): Promise<void> => {
    const companion: IStudioEnterpriseTeamCompanion = await create(asset)({
      employee: props.employee,
      role: props.role,
    });
    await login(
      asset.pool,
      props.manager.type === "member" ? props.manager : props.manager.member,
    );
    await HubApi.functional.studio.customers.enterprises.teams.companions.erase(
      asset.pool.customer,
      asset.enterprise.account.code,
      asset.team.code,
      companion.id,
    );

    await login(asset.pool, props.employee.member);
    await TestValidator.httpError("erased")(404)(async () =>
      HubApi.functional.studio.customers.enterprises.teams.companions.at(
        asset.pool.customer,
        asset.enterprise.account.code,
        asset.team.code,
        companion.id,
      ),
    );
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
