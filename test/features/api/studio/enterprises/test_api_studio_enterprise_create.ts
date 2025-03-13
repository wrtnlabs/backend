import { RandomGenerator, TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "../accounts/internal/generate_random_account";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";

export const test_api_studio_enterprise_create = async (
  pool: ConnectionPool,
): Promise<void> => {
  const customer: IHubCustomer = await test_api_hub_customer_join(pool);
  const alpha: string = RandomGenerator.alphabets(8);
  const beta: string = RandomGenerator.alphabets(8);

  await generate_random_account(pool, { code: alpha });
  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: beta,
  });
  TestValidator.equals("enterprise.account.code")(beta)(
    enterprise.account.code,
  );

  //----
  // VALIDATIONS
  //----
  // CREATOR IS THE OWNER EMPLOYEE
  const employees: IPage<IStudioEnterpriseEmployee.ISummary> =
    await HubApi.functional.studio.customers.enterprises.employees.index(
      pool.customer,
      enterprise.account.code,
      {
        limit: 2,
      },
    );
  TestValidator.equals("employees.length")(employees.data.length)(1);
  TestValidator.equals("owner")({
    type: "employee",
    member: {
      id: customer.member!.id,
      type: "member",
    },
    title: "owner",
  })(employees.data[0]);

  // THROUGH ID
  const readById: IStudioEnterprise =
    await HubApi.functional.studio.customers.enterprises.at(
      pool.customer,
      enterprise.id,
    );
  TestValidator.equals("readById")(beta)(readById.account.code);

  // THROUGH CODE
  const readByCode: IStudioEnterprise =
    await HubApi.functional.studio.customers.enterprises.get(
      pool.customer,
      beta,
    );
  TestValidator.equals("readByCode")(beta)(readByCode.account.code);

  TestValidator.equals("customer.member.account")(
    typia.assert(
      await HubApi.functional.hub.customers.authenticate.get(pool.customer),
    ).member?.account?.code,
  )(alpha);
};
