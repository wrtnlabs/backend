import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";

export const test_api_hub_customer_update = async (pool: ConnectionPool) => {
  const customer: IHubCustomer = await test_api_hub_customer_create(pool);

  const update: IHubCustomer =
    await HubApi.functional.hub.customers.authenticate.update(pool.customer, {
      lang_code: "en",
    });

  TestValidator.equals("no lang_code")(customer.lang_code)(null);
  TestValidator.equals("lang_code")(update.lang_code)("en");
};
