import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "./test_api_hub_customer_join";

export const test_api_hub_customer_email_verification_already_join = async (
  pool: ConnectionPool,
): Promise<void> => {
  const customer = await test_api_hub_customer_join(pool);

  const email = customer.member.emails.at(0)?.value;

  if (!email) {
    throw new Error("Email is empty.");
  }

  await TestValidator.httpError("Already joined local.")(409)(() =>
    HubApi.functional.hub.customers.emails.verifications.send(pool.customer, {
      email,
      type: "sign-up",
    }),
  );
};
