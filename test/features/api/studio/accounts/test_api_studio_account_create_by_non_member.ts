import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_create } from "../../hub/actors/test_api_hub_customer_create";
import { generate_random_account } from "./internal/generate_random_account";

export const test_api_studio_account_create_by_non_member = async (
  pool: ConnectionPool,
): Promise<void> => {
  const generate = () => generate_random_account(pool);

  await test_api_hub_customer_create(pool);
  await TestValidator.httpError("guest")(403)(generate);

  // await HubApi.functional.hub.customers.externals.external(
  //   pool.customer,
  //   {},
  // );
  // await TestValidator.httpError("external")(403)(generate);

  await HubApi.functional.hub.customers.citizens.activate(pool.customer, {
    name: RandomGenerator.name(),
    mobile: RandomGenerator.mobile(),
  });
  await TestValidator.httpError("citizen")(403)(generate);
};
