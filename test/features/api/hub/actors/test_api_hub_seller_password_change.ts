import { TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";
import { test_api_hub_seller_join } from "./test_api_hub_seller_join";

export const test_api_hub_seller_password_change = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 회원 가입
  const joined: IHubSeller.IInvert = await test_api_hub_seller_join(pool);

  const login = async (password: string) => {
    await test_api_hub_customer_create(pool, pool.seller);
    const authorized: IHubSeller.IInvert =
      await HubApi.functional.hub.sellers.authenticate.login(pool.seller, {
        email: joined.member.emails[0].value,
        password,
      });
    return authorized;
  };

  // 로그인 재실시
  const first: IHubSeller.IInvert = await login(TestGlobal.PASSWORD);
  validate("login")(joined)(first);

  // 비밀번호 변경
  await HubApi.functional.hub.customers.members.password.change(pool.seller, {
    oldbie: TestGlobal.PASSWORD,
    newbie: NEW_PASSWORD,
  });

  // 이전 비밀번호로 로그인 시도 -> 실패
  await TestValidator.httpError("previous")(403)(() =>
    login(TestGlobal.PASSWORD),
  );

  // 새 비밀번호로 로그인 -> 성공
  const after: IHubSeller.IInvert = await login(NEW_PASSWORD);
  validate("after")(joined)(after);

  // 다시 이전 비밀번호로 복구
  await HubApi.functional.hub.customers.members.password.change(pool.seller, {
    oldbie: NEW_PASSWORD,
    newbie: TestGlobal.PASSWORD,
  });
  const again: IHubSeller.IInvert = await login(TestGlobal.PASSWORD);
  validate("again")(joined)(again);
};

const validate =
  (title: string) => (x: IHubSeller.IInvert) => (y: IHubSeller.IInvert) =>
    TestValidator.equals(title)(
      typia.misc.clone<Omit<IHubSeller.IInvert, "customer">>(x),
    )(y);

const NEW_PASSWORD = "something";
