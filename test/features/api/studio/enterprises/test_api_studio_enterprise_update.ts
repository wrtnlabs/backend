import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_enterprise } from "./internal/generate_random_enterprise";

export const test_api_studio_enterprise_update = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);

  const enterprise: IStudioEnterprise = await generate_random_enterprise(pool, {
    migrate: false,
    account: RandomGenerator.alphabets(8),
  });
  const input: IStudioEnterprise.IUpdate = {
    name: RandomGenerator.alphabets(8),
  };

  await HubApi.functional.studio.customers.enterprises.update(
    pool.customer,
    enterprise.id,
    input,
  );

  const read: IStudioEnterprise =
    await HubApi.functional.studio.customers.enterprises.at(
      pool.customer,
      enterprise.id,
    );
  TestValidator.equals("updated")(input)(read);
  TestValidator.equals("entire")({
    ...enterprise,
    ...input,
  })(read);
};
