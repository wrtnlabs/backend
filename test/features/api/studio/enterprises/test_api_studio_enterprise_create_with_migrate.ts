import { RandomGenerator, TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "../accounts/internal/generate_random_account";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";

export const test_api_studio_enterprise_create_with_migrate = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  const alpha: string = RandomGenerator.alphabets(8);
  const beta: string = RandomGenerator.alphabets(8);

  await generate_random_account(pool, { code: alpha });
  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    new_account_for_customer: beta,
    migrate: true,
  });
  TestValidator.equals("enterprise.account.code")(alpha)(
    enterprise.account.code,
  );

  const readById: IStudioEnterprise =
    await HubApi.functional.studio.customers.enterprises.at(
      pool.customer,
      enterprise.id,
    );
  typia.assertEquals(readById);
  TestValidator.equals("readById")(alpha)(readById.account.code);

  const readByCode: IStudioAccount =
    await HubApi.functional.studio.customers.accounts.get(pool.customer, beta);
  TestValidator.equals("readByCode")(beta)(readByCode.code);

  const customer: IHubCustomer =
    await HubApi.functional.hub.customers.authenticate.get(pool.customer);
  typia.assertEquals(customer);
  TestValidator.equals("customer.member.account")(
    customer.member?.account?.code,
  )(beta);
};
