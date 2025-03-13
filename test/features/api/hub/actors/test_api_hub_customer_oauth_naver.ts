import { RandomGenerator, TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";

export const test_api_hub_customer_oauth_naver = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_customer_create(pool);

  const authUrl =
    await HubApi.functional.hub.customers.authenticate.oauth.auth_url.getAuthUrl(
      pool.customer,
      "naver",
      {
        redirect_uri: "http://localhost/callback",
      },
    );

  typia.assert(authUrl);

  const email = `oauth-${RandomGenerator.alphaNumeric(16)}@wrtn.io`;

  const naverCode = await fetch("https://give_me_the_authorization_code", {
    headers: { email },
  })
    .then((v) => v.json())
    .then((v) => v.code);

  const res = await HubApi.functional.hub.customers.authenticate.oauth.login(
    pool.customer,
    "naver",
    {
      redirect_uri: "http://localhost/callback",
      authorization_code: naverCode,
    },
  );

  TestValidator.equals("input and output email must be same")(email)(
    res.member.emails[0].value,
  );
};
