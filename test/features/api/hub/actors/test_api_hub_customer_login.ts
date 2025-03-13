import { TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";
import { test_api_hub_customer_join } from "./test_api_hub_customer_join";

export const test_api_hub_customer_login = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 회원 가입 실시
  const joined: IHubCustomer = await test_api_hub_customer_join(pool);

  // 새 고객 레코드 발행
  const issued: IHubCustomer.IAuthorized =
    await test_api_hub_customer_create(pool);
  TestValidator.equals("issued.member")(false)(!!issued.member);

  // 로그인 실시 후 이전 회원 가입시 정보와 비교
  const passed: IHubCustomer =
    await HubApi.functional.hub.customers.members.login(pool.customer, {
      email: joined.member!.emails[0].value,
      password: TestGlobal.PASSWORD,
    });
  TestValidator.equals("passed")(
    typia.misc.clone<Omit<IHubCustomer, "id" | "created_at">>(joined),
  )(passed);
};
