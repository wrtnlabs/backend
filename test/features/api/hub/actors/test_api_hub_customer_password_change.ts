import { TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";
import { test_api_hub_customer_join } from "./test_api_hub_customer_join";

export const test_api_hub_customer_password_change = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 회원 가입 실시
  const joined: IHubCustomer = await test_api_hub_customer_join(pool);
  const login = async (password: string) => {
    await test_api_hub_customer_create(pool);
    const authorized: IHubCustomer =
      await HubApi.functional.hub.customers.members.login(pool.customer, {
        email: joined.member!.emails[0].value,
        password,
      });
    return authorized;
  };

  // 로그인 재실시
  const first: IHubCustomer = await login(TestGlobal.PASSWORD);
  validate("login")(joined)(first);

  // 비밀번호 변경
  await HubApi.functional.hub.customers.members.password.change(pool.customer, {
    oldbie: TestGlobal.PASSWORD,
    newbie: NEW_PASSWORD,
  });

  // 이전 비밀번호로 로그인 시도 -> 실패
  await TestValidator.httpError("previous")(403)(() =>
    login(TestGlobal.PASSWORD),
  );

  // 새 비밀번호로 로그인 -> 성공
  const after: IHubCustomer = await login(NEW_PASSWORD);
  validate("after")(joined)(after);

  // 다시 이전 비밀번호로 복구
  await HubApi.functional.hub.customers.members.password.change(pool.customer, {
    oldbie: NEW_PASSWORD,
    newbie: TestGlobal.PASSWORD,
  });
  const again: IHubCustomer = await login(TestGlobal.PASSWORD);
  validate("again")(joined)(again);
};

const validate = (title: string) => (x: IHubCustomer) => (y: IHubCustomer) =>
  TestValidator.equals(title)(
    typia.misc.clone<Omit<IHubCustomer, "id" | "created_at">>(x),
  )(y);

const NEW_PASSWORD = "something";
