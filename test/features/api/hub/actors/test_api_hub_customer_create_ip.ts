import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { ConnectionPool } from "../../../../ConnectionPool";

export const test_api_hub_customer_create_ip = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 각각 IP 자동/수동 고객 레코드 발행
  const automatic = await issue(pool, undefined);
  const manual = await issue(pool, PSEUDO);

  // IP 가 원하는대로 할당되었나 검증
  TestValidator.predicate("automatic")(() => automatic.ip !== PSEUDO);
  TestValidator.equals("manual")(manual.ip)(PSEUDO);
};

const issue = async (pool: ConnectionPool, ip?: string) => {
  const customer: IHubCustomer.IAuthorized =
    await HubApi.functional.hub.customers.authenticate.create(pool.customer, {
      href: "http://localhost/TestAutomation",
      referrer: "http://localhost/NodeJS",
      channel_code: pool.channel,
      external_user: null,
      ip,
      lang_code: null,
    });
  return customer;
};

const PSEUDO = "0.1.2.3";
