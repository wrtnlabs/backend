import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { TestGlobal } from "../../../../../TestGlobal";
import { test_api_hub_customer_create } from "../../../hub/actors/test_api_hub_customer_create";

export const generate_random_enterprise_employee = async (
  pool: ConnectionPool,
  enterprise: IStudioEnterprise,
  member: IHubMember,
  title: IStudioEnterpriseEmployee.Title,
  approve:
    | false
    | {
        manager: IHubMember | null;
      },
): Promise<IStudioEnterpriseEmployee> => {
  const employee: IStudioEnterpriseEmployee =
    await HubApi.functional.studio.customers.enterprises.employees.create(
      pool.customer,
      enterprise.account.code,
      {
        member_id: member.id,
        title,
      },
    );
  if (approve === false) return employee;

  await login(pool, member);
  const beApproved: IStudioEnterpriseEmployee =
    await HubApi.functional.studio.customers.enterprises.employees.approve(
      pool.customer,
      enterprise.account.code,
    );

  if (approve.manager !== null) await login(pool, approve.manager);
  return beApproved;
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
