import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";
import { IHubAuthenticateKey } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAuthenticateKey";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "./test_api_hub_customer_join";
import { test_api_hub_customer_login } from "./test_api_hub_customer_login";
import { test_api_hub_seller_login } from "./test_api_hub_seller_login";

export const test_api_hub_customer_authenticate_key_at = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  await test_api_hub_customer_login(pool);

  const key: IHubAuthenticateKey =
    await HubApi.functional.hub.customers.authenticate.keys.create(
      pool.customer,
      {
        title: RandomGenerator.name(),
        channel_code: "wrtn",
      },
    );

  const read: IHubAuthenticateKey =
    await HubApi.functional.hub.customers.authenticate.keys.at(
      pool.customer,
      key.id,
    );
  TestValidator.equals("at")(key)(read);

  await test_api_hub_seller_login(pool);

  await HubApi.functional.hub.customers.authenticate.keys.deprecated(
    pool.customer,
    key.id,
  );
};
