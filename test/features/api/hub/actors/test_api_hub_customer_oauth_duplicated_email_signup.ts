import { TestValidator } from "@nestia/e2e";
import typia, { tags } from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";

export const test_api_hub_customer_oauth_duplicated_email_signup = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_create(pool);

  const authUrl =
    await HubApi.functional.hub.customers.authenticate.oauth.auth_url.getAuthUrl(
      pool.customer,
      "google",
      {
        redirect_uri: "http://localhost/callback",
        scope: "hi hello",
      },
    );

  typia.assert(authUrl);

  // set fixed return email value.
  const fixedEmail = typia.random<string & tags.Format<"email">>();

  // First, Sign up for google oauth.
  const googleCode = await fetch("https://give_me_the_authorization_code", {
    headers: { email: fixedEmail },
  })
    .then((v) => v.json())
    .then((v) => v.code);

  const google = await HubApi.functional.hub.customers.authenticate.oauth.login(
    pool.customer,
    "google",
    {
      redirect_uri: "http://localhost/callback",
      authorization_code: googleCode,
    },
  );

  await test_api_hub_customer_create(pool);

  // Second, Sign up for apple oauth with the same email.
  const appleCode = await fetch("https://give_me_the_authorization_code", {
    headers: { email: fixedEmail },
  })
    .then((v) => v.json())
    .then((v) => v.code);

  const apple = await HubApi.functional.hub.customers.authenticate.oauth.login(
    pool.customer,
    "apple",
    {
      redirect_uri: "http://localhost/callback",
      authorization_code: appleCode,
    },
  );

  if (google.member.emails[0].value !== apple.member.emails[0].value) {
    throw new Error("Email is different.");
  }

  TestValidator.equals("Email")(google.member.emails[0].value)(
    apple.member.emails[0].value,
  );
  TestValidator.equals("google provider")(google.external_user.application)(
    "google",
  );
  TestValidator.equals("apple provider")(apple.external_user.application)(
    "apple",
  );

  await TestValidator.httpError("can't resign-up with same oauth provider")(
    410,
  )(() =>
    HubApi.functional.hub.customers.authenticate.oauth.login(
      pool.customer,
      "apple",
      {
        redirect_uri: "http://localhost/callback",
        authorization_code: appleCode,
      },
    ),
  );
};
