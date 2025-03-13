import {
  ArrayUtil,
  GaffComparator,
  RandomGenerator,
  TestValidator,
} from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";
import { generate_random_enterprise_employee } from "./internal/generate_random_enterprise_employee";

export const test_api_studio_enterprise_employee_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  const memberList: IHubMember[] = await ArrayUtil.asyncRepeat(REPEAT)(
    async () => {
      const { member } = await test_api_hub_customer_join(pool);
      return member;
    },
  );
  await test_api_hub_customer_join(pool);

  const { member: owner } = await test_api_hub_customer_join(pool);
  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: RandomGenerator.alphabets(8),
  });
  await ArrayUtil.asyncMap(memberList)((member) =>
    generate_random_enterprise_employee(
      pool,
      enterprise,
      member,
      RandomGenerator.pick(
        typia.misc.literals<IStudioEnterpriseEmployee.Title>(),
      ),
      Math.random() < 0.5
        ? false
        : {
            manager: owner,
          },
    ),
  );

  const validator = TestValidator.sort("employees.index")<
    IStudioEnterpriseEmployee.ISummary,
    IStudioEnterpriseEmployee.IRequest.SortableColumns,
    IPage.Sort<IStudioEnterpriseEmployee.IRequest.SortableColumns>
  >(async (
    input: IPage.Sort<IStudioEnterpriseEmployee.IRequest.SortableColumns>,
  ) => {
    const page: IPage<IStudioEnterpriseEmployee.ISummary> =
      await HubApi.functional.studio.customers.enterprises.employees.index(
        pool.customer,
        enterprise.account.code,
        {
          sort: input,
          limit: REPEAT,
        },
      );
    return page.data;
  });

  const components = [
    validator("employee.created_at")(GaffComparator.dates((x) => x.created_at)),
    validator("employee.approved_at")(
      GaffComparator.dates(
        (x) => x.approved_at ?? new Date("9999-12-31").toISOString(),
      ),
    ),
    validator("employee.title")(GaffComparator.strings((x) => x.title)),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};

const REPEAT = 25;
