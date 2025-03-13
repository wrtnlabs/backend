import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCitizen } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCitizen";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";

export const test_api_hub_customer_activate = async (
  pool: ConnectionPool,
): Promise<IHubCustomer> => {
  // 고객 레코드 발행 -> 시민 인증 전
  const issued: IHubCustomer.IAuthorized =
    await test_api_hub_customer_create(pool);
  TestValidator.equals("issued.citizen")(false)(!!issued.citizen);

  // 시민 인증 후 재검증
  const input: IHubCitizen.ICreate = {
    name: RandomGenerator.name(8),
    mobile: RandomGenerator.mobile(),
  };
  const activated: IHubCustomer =
    await HubApi.functional.hub.customers.citizens.activate(
      pool.customer,
      input,
    );
  TestValidator.equals("activate.citizen")(input)(activated.citizen!);

  return activated;
};
