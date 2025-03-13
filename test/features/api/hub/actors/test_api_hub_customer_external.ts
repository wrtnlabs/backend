import { RandomGenerator, TestValidator } from "@nestia/e2e";
import typia from "typia";
import { v4 } from "uuid";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";

export const test_api_hub_customer_external = async (
  pool: ConnectionPool,
): Promise<IHubCustomer> => {
  // 첫 고객 레코드 발행시, 모든 연관 정보가 NULL
  const issued: IHubCustomer.IAuthorized =
    await test_api_hub_customer_create(pool);
  validate("issue")(issued)({
    ...issued,
    citizen: null,
    external_user: null,
    member: null,
  });

  // 외부 유저 인증 -> IHubCustomer.external_user
  const input = {
    external: {
      application: "test-application",
      uid: v4(),
      nickname: RandomGenerator.name(8),
      citizen: null,
      data: null,
      password: v4(),
      content: null,
    } satisfies IHubExternalUser.ICreate,
    citizen: {
      name: RandomGenerator.name(8),
      mobile: RandomGenerator.mobile(),
    },
  };
  const external: IHubCustomer =
    await HubApi.functional.hub.customers.externals.external(pool.customer, {
      ...input.external,
      content: null,
    });
  validate("external")(external)({
    ...issued,
    external_user: {
      ...external.external_user!,
      ...input.external,
      content: null,
      citizen: null,
    },
  });

  // 시민 인증 -> IHubCustomer.(citizen & external_user)
  const citizen: IHubCustomer =
    await HubApi.functional.hub.customers.citizens.activate(
      pool.customer,
      input.citizen,
    );
  citizen;
  validate("citizen")(citizen)({
    ...issued,
    citizen: {
      ...citizen.citizen!,
      ...input.citizen,
    },
    external_user: {
      ...citizen.external_user!,
      ...input.external,
      content: null,
      citizen: citizen.citizen,
    },
  });

  // 고객 레코드 다시 발행하여 외부 유저 인증 후 검증
  await test_api_hub_customer_create(pool);
  await HubApi.functional.hub.customers.externals.external(
    pool.customer,
    input.external,
  );
  validate("again")(citizen)(
    await HubApi.functional.hub.customers.authenticate.refresh(pool.customer, {
      value: issued.token.refresh,
    }),
  );
  return citizen;
};

const validate =
  (title: string) => (x: IHubCustomer) => (y: IHubCustomer.IAuthorized) =>
    TestValidator.equals(title)(
      typia.misc.clone<Omit<IHubCustomer, "created_at">>(x),
    )(y);
