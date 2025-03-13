import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubAuthenticateKey } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAuthenticateKey";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "./test_api_hub_customer_join";
import { test_api_hub_customer_login } from "./test_api_hub_customer_login";

export const test_api_hub_customer_authenticate_key_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);

  await ArrayUtil.asyncRepeat(5)(async () => {
    await test_api_hub_customer_login(pool);
    await HubApi.functional.hub.customers.authenticate.keys.create(
      pool.customer,
      {
        title: RandomGenerator.name(),
        channel_code: "wrtn",
      },
    );
  });

  await ArrayUtil.asyncRepeat(5)(async () => {
    const key: IHubAuthenticateKey =
      await HubApi.functional.hub.customers.authenticate.keys.create(
        pool.customer,
        {
          title: RandomGenerator.name(),
          channel_code: "wrtn",
        },
      );
    return key;
  });

  const total: IPage<IHubAuthenticateKey> =
    await HubApi.functional.hub.customers.authenticate.keys.index(
      pool.customer,
      {
        limit: 5,
        page: 1,
      },
    );
  total;

  TestValidator.search("authenticate.keys.index")(
    async (input: IHubAuthenticateKey.IRequest.ISearch) => {
      const page: IPage<IHubAuthenticateKey> =
        await HubApi.functional.hub.customers.authenticate.keys.index(
          pool.customer,
          {
            search: input,
            sort: ["-created_at"],
          },
        );
      return page.data;
    },
  )(total.data, 4);

  // await search({
  //   fields: ["key.id"],
  //   values: (key) => [key.id],
  //   request: ([id]) => ({ id }),
  //   filter: (key, [id]) => key.id === id,
  // });
};
