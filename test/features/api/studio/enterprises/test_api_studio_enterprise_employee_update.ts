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

export const test_api_studio_enterprise_employee_update = async (
  pool: ConnectionPool,
): Promise<void> => {
  const owner: IHubMember = await membership(pool);
  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: RandomGenerator.alphabets(8),
  });
  const executor = change({ pool, enterprise, owner });

  // OWNER CAN DO EVERYTHING
  for (const first of typia.misc.literals<IStudioEnterpriseEmployee.Title>())
    for (const second of typia.misc.literals<IStudioEnterpriseEmployee.Title>()) {
      if (first === second) continue;
      await executor({
        manager: owner,
        target: await membership(pool),
        first,
        second,
      });
    }

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
  for (const first of typia.misc.literals<IStudioEnterpriseEmployee.Title>())
    for (const second of typia.misc.literals<IStudioEnterpriseEmployee.Title>()) {
      if (first === second) continue;
      const task = async () =>
        executor({
          manager,
          target: await membership(pool),
          first,
          second,
        });
      if (
        first === "owner" ||
        first === "manager" ||
        second === "owner" ||
        second === "manager"
      ) {
        if (second === "member" || second === "observer") return;
        await TestValidator.httpError(
          "manager can't change or change to owner and manager",
        )(403)(task);
      } else await task();
    }

  const member: IHubMember = await membership(pool);
  const observer: IHubMember = await membership(pool);
  // MEMBER AND OBSERVER CAN'T DO ANYTHING
  for (const actor of [member, observer])
    for (const first of typia.misc.literals<IStudioEnterpriseEmployee.Title>())
      for (const second of typia.misc.literals<IStudioEnterpriseEmployee.Title>()) {
        if (first === second) continue;
        await TestValidator.httpError("member and observer can't do anything")(
          403,
        )(async () =>
          executor({
            manager: actor,
            target: await membership(pool),
            first,
            second,
          }),
        );
      }
};

const change =
  (asset: {
    pool: ConnectionPool;
    enterprise: IStudioEnterprise;
    owner: IHubMember;
  }) =>
  async (props: {
    manager: IHubMember;
    target: IHubMember;
    first: IStudioEnterpriseEmployee.Title;
    second: IStudioEnterpriseEmployee.Title;
  }): Promise<void> => {
    await login(asset.pool, asset.owner);
    const employee: IStudioEnterpriseEmployee =
      await generate_random_enterprise_employee(
        asset.pool,
        asset.enterprise,
        props.target,
        props.first,
        {
          manager: props.manager,
        },
      );

    await login(asset.pool, props.manager);
    await HubApi.functional.studio.customers.enterprises.employees.update(
      asset.pool.customer,
      asset.enterprise.account.code,
      employee.id,
      {
        title: props.second,
      },
    );

    await login(asset.pool, employee.member);
    const read: IStudioEnterpriseEmployee =
      await HubApi.functional.studio.customers.enterprises.employees.at(
        asset.pool.customer,
        asset.enterprise.account.code,
        employee.id,
      );
    TestValidator.equals("read")({
      ...employee,
      title: props.second,
      updated_at: read.updated_at,
    })(read);
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
