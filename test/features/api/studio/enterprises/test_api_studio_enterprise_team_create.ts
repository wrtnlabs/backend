import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";
import { IStudioEnterpriseTeam } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeam";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "../../hub/actors/test_api_hub_customer_create";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";
import { generate_random_enterprise_employee } from "./internal/generate_random_enterprise_employee";
import { generate_random_enterprise_team } from "./internal/generate_random_enterprise_team";

export const test_api_studio_enterprise_team_create = async (
  pool: ConnectionPool,
): Promise<void> => {
  const { member: owner } = await test_api_hub_customer_join(pool);
  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: RandomGenerator.alphabets(8),
  });
  const executor = create({ pool, enterprise });
  const inviter = partnership({ pool, enterprise, owner });

  await executor(owner);
  await executor(await inviter("manager"));
  await TestValidator.httpError("member")(403)(async () =>
    executor(await inviter("member")),
  );
  await TestValidator.httpError("observer")(403)(async () =>
    executor(await inviter("observer")),
  );
};

const create =
  (asset: { pool: ConnectionPool; enterprise: IStudioEnterprise }) =>
  async (actor: IHubMember | IStudioEnterpriseEmployee): Promise<void> => {
    await login(asset.pool, actor.type === "employee" ? actor.member : actor);
    const team: IStudioEnterpriseTeam = await generate_random_enterprise_team(
      asset.pool,
      asset.enterprise,
    );

    const read: IStudioEnterpriseTeam =
      await HubApi.functional.studio.customers.enterprises.teams.at(
        asset.pool.customer,
        asset.enterprise.account.code,
        team.id,
      );
    TestValidator.equals("read")(team)(read);

    const got: IStudioEnterpriseTeam =
      await HubApi.functional.studio.customers.enterprises.teams.get(
        asset.pool.customer,
        asset.enterprise.account.code,
        team.code,
      );
    TestValidator.equals("got")(team)(got);
  };

const partnership =
  (props: {
    pool: ConnectionPool;
    enterprise: IStudioEnterprise;
    owner: IHubMember;
  }) =>
  async (
    title: IStudioEnterpriseEmployee.Title,
  ): Promise<IStudioEnterpriseEmployee> => {
    const { member } = await test_api_hub_customer_join(props.pool);
    await login(props.pool, props.owner);

    const employee: IStudioEnterpriseEmployee =
      await generate_random_enterprise_employee(
        props.pool,
        props.enterprise,
        member,
        title,
        {
          manager: props.owner,
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
