import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";
import { generate_random_enterprise_employee } from "./internal/generate_random_enterprise_employee";

export const test_api_studio_enterprise_employee_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  const memberList: IHubMember[] = await ArrayUtil.asyncRepeat(REPEAT)(
    async () => {
      const { member } = await test_api_hub_customer_join(pool);
      return member;
    },
  );

  const owner: IHubMember = await membership(pool);
  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: RandomGenerator.alphabets(8),
  });

  await ArrayUtil.asyncMap(memberList)((member) => {
    return generate_random_enterprise_employee(
      pool,
      enterprise,
      member,
      RandomGenerator.pick(["member", "observer", "manager"]),
      Math.random() < 0.5
        ? false
        : {
            manager: owner,
          },
    );
  });

  const total: IPage<IStudioEnterpriseEmployee.ISummary> =
    await HubApi.functional.studio.customers.enterprises.employees.index(
      pool.customer,
      enterprise.account.code,
      {
        limit: REPEAT,
        sort: ["-employee.created_at"],
      },
    );

  const validator = TestValidator.search("employees.index")(
    async (input: IStudioEnterpriseEmployee.IRequest.ISearch) => {
      const page: IPage<IStudioEnterpriseEmployee.ISummary> =
        await HubApi.functional.studio.customers.enterprises.employees.index(
          pool.customer,
          enterprise.account.code,
          {
            search: input,
            limit: REPEAT,
            sort: ["-employee.created_at"],
          },
        );
      return page.data;
    },
  )(total.data, 4);

  await validator({
    fields: ["title"],
    values: (e) => [e.title],
    filter: (e, [title]) => e.title === title,
    request: ([title]) => ({ title }),
  });
  await validator({
    fields: ["approved"],
    values: (e) => [!!e.approved_at],
    filter: (e, [approved]) => !!e.approved_at === approved,
    request: ([approved]) => ({ approved }),
  });
  await validator({
    fields: ["from", "to"],
    values: (e) => [
      new Date(new Date(e.created_at).getTime() - 500).toISOString(),
      new Date(new Date(e.created_at).getTime() + 500).toISOString(),
    ],
    filter: (e, [from, to]) =>
      new Date(e.created_at).getTime() >= new Date(from).getTime() &&
      new Date(e.created_at).getTime() <= new Date(to).getTime(),
    request: ([from, to]) => ({ from, to }),
  });
};

const membership = async (pool: ConnectionPool): Promise<IHubMember> => {
  const { member } = await test_api_hub_customer_join(pool);
  return member;
};

const REPEAT = 25;
