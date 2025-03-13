import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "./test_api_hub_customer_join";

export const test_api_hub_customer_member_update = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_customer_join(pool);
  const newbie = `customer-${RandomGenerator.alphaNumeric(16)}@wrtn.io`;

  const before = await HubApi.functional.hub.customers.members.update(
    pool.customer,
    {
      nickname: newbie,
    },
  );

  TestValidator.equals("before.nickname")(newbie)(before.nickname);
};
