import typia, { tags } from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";

export const test_api_hub_customer_check_duplicated_nickname_in_oauth = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_customer_create(pool);

  const originNickname = `michael`;

  const authUrl =
    await HubApi.functional.hub.customers.authenticate.oauth.auth_url.getAuthUrl(
      pool.customer,
      "kakao",
      {
        redirect_uri: "http://localhost/callback",
      },
    );

  typia.assert(authUrl);

  const kakaoCode = await fetch("https://give_me_the_authorization_code", {
    headers: { email: typia.random<string & tags.Format<"email">>() },
  })
    .then((v) => v.json())
    .then((v) => v.code);

  const res = await HubApi.functional.hub.customers.authenticate.oauth.login(
    pool.customer,
    "kakao",
    {
      redirect_uri: "http://localhost/callback",
      authorization_code: kakaoCode,
    },
  );

  await test_api_hub_customer_create(pool);

  const authUrl2 =
    await HubApi.functional.hub.customers.authenticate.oauth.auth_url.getAuthUrl(
      pool.customer,
      "kakao",
      {
        redirect_uri: "http://localhost/callback",
      },
    );

  typia.assert(authUrl2);

  const kakaoCode2 = await fetch("https://give_me_the_authorization_code", {
    headers: { email: typia.random<string & tags.Format<"email">>() },
  })
    .then((v) => v.json())
    .then((v) => v.code);

  const res2 = await HubApi.functional.hub.customers.authenticate.oauth.login(
    pool.customer,
    "kakao",
    {
      redirect_uri: "http://localhost/callback",
      authorization_code: kakaoCode2,
    },
  );

  if (
    !res.member.nickname.includes(originNickname) ||
    !res2.member.nickname.includes(originNickname)
  ) {
    throw new Error("Origin Nickname is not included created member nickname");
  }

  if (
    res.member.nickname.split(originNickname)[1] ===
    res2.member.nickname.split(originNickname)[1]
  ) {
    throw new Error("Please Check OAuth Login API. Nickname is not unique.");
  }
};
