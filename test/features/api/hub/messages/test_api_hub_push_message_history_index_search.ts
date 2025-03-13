import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { v4 } from "uuid";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubPushMessage } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessage";
import { IHubPushMessageHistory } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessageHistory";

import { HubPushMessageHistoryProvider } from "../../../../../src/providers/hub/messages/HubPushMessageHistoryProvider";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";

export const test_api_hub_push_message_history_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  const customer: IHubCustomer = await test_api_hub_customer_join(pool);
  const message: IHubPushMessage =
    await HubApi.functional.hub.admins.push_messages.create(pool.admin, {
      code: RandomGenerator.alphabets(16),
      source: RandomGenerator.alphabets(16),
      target: "customer",
      content: {
        title: RandomGenerator.paragraph(3)(3),
        body: RandomGenerator.paragraph(3)(3),
      },
    });
  const total: IHubPushMessageHistory[] = await ArrayUtil.asyncRepeat(10)(() =>
    HubPushMessageHistoryProvider.create(customer)({
      listener: customer,
      message,
      source: { id: v4() },
      variables: {},
    }),
  );

  const validator = TestValidator.search("histories.index")(
    async (input: IHubPushMessageHistory.IRequest.ISearch) => {
      const page: IPage<IHubPushMessageHistory> =
        await HubApi.functional.hub.customers.push_messages.histories.index(
          pool.customer,
          {
            limit: 10,
            sort: ["-history.created_at"],
            search: input,
          },
        );
      return page.data;
    },
  )(total, 4);

  await validator({
    fields: ["from"],
    values: (h) => [h.created_at],
    request: ([from]) => ({ from }),
    filter: (h, [from]) => new Date(h.created_at) >= new Date(from),
  });
  await validator({
    fields: ["to"],
    values: (h) => [h.created_at],
    request: ([to]) => ({ to }),
    filter: (h, [to]) => new Date(h.created_at) <= new Date(to),
  });
  await validator({
    fields: ["message.code"],
    values: (h) => [h.message.code],
    request: ([code]) => ({ message: { code } }),
    filter: (h, [code]) => h.message.code === code,
  });

  await HubApi.functional.hub.admins.push_messages.erase(
    pool.admin,
    message.id,
  );
};
