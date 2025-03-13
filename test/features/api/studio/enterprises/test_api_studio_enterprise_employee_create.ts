import { RandomGenerator, TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "../../hub/actors/test_api_hub_customer_create";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";
import { generate_random_enterprise_employee } from "./internal/generate_random_enterprise_employee";

export const test_api_studio_enterprise_employee_create = async (
  pool: ConnectionPool,
): Promise<void> => {
  const owner: IHubMember = await membership(pool);
  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: RandomGenerator.alphabets(8),
  });
  const executor = invite({ pool, enterprise });

  // OWNER CAN DO EVERYTHING
  for (const title of typia.misc.literals<IStudioEnterpriseEmployee.Title>())
    await executor({
      manager: owner,
      target: await membership(pool),
      title,
    });

  // MANAGER CAN INVITE MEMBER AND OBSERVER
  const manager: IStudioEnterpriseEmployee = await executor({
    manager: owner,
    target: await membership(pool),
    title: "manager",
  });
  const member: IStudioEnterpriseEmployee = await executor({
    manager: manager,
    target: await membership(pool),
    title: "member",
  });
  const observer: IStudioEnterpriseEmployee = await executor({
    manager: manager,
    target: await membership(pool),
    title: "observer",
  });
  for (const title of ["owner", "manager"] as const)
    await TestValidator.httpError("manager can't invite owner or manager")(403)(
      async () =>
        executor({
          manager: manager,
          target: await membership(pool),
          title,
        }),
    );

  // MEMBER AND OBSERVER CAN'T DO ANYTHING
  for (const actor of [member, observer])
    for (const title of typia.misc.literals<IStudioEnterpriseEmployee.Title>())
      await TestValidator.httpError("member can't invite")(403)(async () =>
        executor({
          manager: actor,
          target: await membership(pool),
          title,
        }),
      );
};

const invite =
  (asset: { pool: ConnectionPool; enterprise: IStudioEnterprise }) =>
  async (props: {
    manager: IHubMember | IStudioEnterpriseEmployee;
    target: IHubMember;
    title: IStudioEnterpriseEmployee.Title;
  }): Promise<IStudioEnterpriseEmployee> => {
    await test_api_hub_customer_create(asset.pool);
    await HubApi.functional.hub.customers.members.login(asset.pool.customer, {
      email: (props.manager.type === "member"
        ? props.manager
        : props.manager.member
      ).emails[0].value,
      password: TestGlobal.PASSWORD,
    });

    const employee: IStudioEnterpriseEmployee =
      await generate_random_enterprise_employee(
        asset.pool,
        asset.enterprise,
        props.target,
        props.title,
        {
          manager:
            props.manager.type === "member"
              ? props.manager
              : props.manager.member,
        },
      );
    await login(asset.pool, props.target);

    const read: IStudioEnterpriseEmployee =
      await HubApi.functional.studio.customers.enterprises.employees.at(
        asset.pool.customer,
        asset.enterprise.account.code,
        employee.id,
      );
    TestValidator.equals("read")(employee)(read);
    return employee;
  };

const membership = async (pool: ConnectionPool): Promise<IHubMember> => {
  const { member } = await test_api_hub_customer_join(pool);
  return member;
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
