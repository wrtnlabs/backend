import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "../../hub/actors/test_api_hub_customer_create";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";
import { generate_random_enterprise_employee } from "./internal/generate_random_enterprise_employee";

export const test_api_studio_enterprise_employee_unapproved = async (
  pool: ConnectionPool,
): Promise<void> => {
  const { member: observer } = await test_api_hub_customer_join(pool);
  const { member: invitee } = await test_api_hub_customer_join(pool);

  await test_api_hub_customer_join(pool);
  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: RandomGenerator.alphabets(8),
  });
  const employee: IStudioEnterpriseEmployee =
    await generate_random_enterprise_employee(
      pool,
      enterprise,
      invitee,
      "manager",
      false,
    );

  await test_api_hub_customer_create(pool);
  await HubApi.functional.hub.customers.members.login(pool.customer, {
    email: invitee.emails[0].value,
    password: TestGlobal.PASSWORD,
  });

  TestValidator.equals("employee.unapproved")(!!employee.approved_at)(false);

  // 어프포브를 하지 않은 상태에서 직원을 조회하면 403 에러가 발생해야 한다.
  await TestValidator.httpError("")(403)(() =>
    HubApi.functional.studio.customers.enterprises.employees.at(
      pool.customer,
      enterprise.account.code,
      employee.id,
    ),
  );

  const approved: IStudioEnterpriseEmployee =
    await HubApi.functional.studio.customers.enterprises.employees.approve(
      pool.customer,
      enterprise.account.code,
    );
  TestValidator.equals("approved")({
    ...employee,
    approved_at: approved.approved_at,
  })(approved);

  await generate_random_enterprise_employee(
    pool,
    enterprise,
    observer,
    "observer",
    {
      manager: invitee,
    },
  );
};
