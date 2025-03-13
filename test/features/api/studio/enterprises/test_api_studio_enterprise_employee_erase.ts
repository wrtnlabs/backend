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

export const test_api_studio_enterprise_employee_erase = async (
  pool: ConnectionPool,
): Promise<void> => {
  const owner: IHubMember = await membership(pool);
  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: RandomGenerator.alphabets(8),
  });
  const executor = erase({ pool, enterprise, owner });

  // OWNER CAN DO EVERYTHING
  for (const title of typia.misc.literals<IStudioEnterpriseEmployee.Title>()) {
    await executor({
      manager: owner,
      target: await membership(pool),
      title,
    });
  }

  // MANAGER ONLY CAN HANDLE MEMBER AND GUEST
  const manager: IHubMember = await membership(pool);
  await loginAndEmployeeCreate({
    pool: pool,
    enterprise: enterprise,
  })({
    owner: owner,
    target: manager,
    title: "manager",
  });
  // MANAGER ONLY CAN HANDLE MEMBER AND GUEST
  for (const title of typia.misc.literals<IStudioEnterpriseEmployee.Title>()) {
    const task = async () =>
      executor({
        manager: manager,
        target: await membership(pool),
        title,
      });

    if (title === "owner" || title === "manager") {
      await TestValidator.httpError("manager can't erase owner or manager")(
        403,
      )(task);
    } else await task();
  }

  // MEMBER AND OBSERVER CAN'T DO ANYTHING
  const member: IHubMember = await membership(pool);
  const observer: IHubMember = await membership(pool);
  for (const actor of [member, observer]) {
    for (const title of typia.misc.literals<IStudioEnterpriseEmployee.Title>()) {
      await TestValidator.httpError("member and observer can't do anything")(
        403,
      )(async () =>
        executor({
          manager: actor,
          target: await membership(pool),
          title,
        }),
      );
    }
  }
};

const erase =
  (asset: {
    pool: ConnectionPool;
    enterprise: IStudioEnterprise;
    owner: IHubMember;
  }) =>
  async (props: {
    manager: IHubMember;
    target: IHubMember;
    title: IStudioEnterpriseEmployee.Title;
  }): Promise<void> => {
    await login(asset.pool, asset.owner);
    const employee: IStudioEnterpriseEmployee =
      await generate_random_enterprise_employee(
        asset.pool,
        asset.enterprise,
        props.target,
        props.title,
        {
          manager: props.manager,
        },
      );

    await login(asset.pool, props.manager);
    await HubApi.functional.studio.customers.enterprises.employees.erase(
      asset.pool.customer,
      asset.enterprise.account.code,
      employee.id,
    );
    await TestValidator.httpError("erased")(404)(() =>
      HubApi.functional.studio.customers.enterprises.employees.erase(
        asset.pool.customer,
        asset.enterprise.account.code,
        employee.id,
      ),
    );
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

const loginAndEmployeeCreate =
  (asset: { pool: ConnectionPool; enterprise: IStudioEnterprise }) =>
  async (props: {
    owner: IHubMember;
    target: IHubMember;
    title: IStudioEnterpriseEmployee.Title;
  }): Promise<IStudioEnterpriseEmployee> => {
    await login(asset.pool, props.owner);
    return generate_random_enterprise_employee(
      asset.pool,
      asset.enterprise,
      props.target,
      props.title,
      {
        manager: props.owner,
      },
    );
  };
