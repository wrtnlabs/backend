import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubPushMessage } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessage";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";

export const test_api_hub_push_message_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  const total: IHubPushMessage[] = await ArrayUtil.asyncRepeat(10)(() =>
    HubApi.functional.hub.admins.push_messages.create(pool.admin, {
      code: RandomGenerator.alphabets(16),
      source: RandomGenerator.alphabets(16),
      target: "customer",
      content: {
        title: RandomGenerator.paragraph(3)(3),
        body: RandomGenerator.paragraph(3)(3),
      },
    }),
  );
  const validator = TestValidator.search("messages.index")(
    async (input: IHubPushMessage.IRequest.ISearch) => {
      const page: IPage<IHubPushMessage> =
        await HubApi.functional.hub.admins.push_messages.index(pool.admin, {
          sort: ["-message.created_at"],
          limit: 10,
          search: input,
        });
      return page.data;
    },
  )(total, 4);

  await validator({
    fields: ["message.code"],
    values: (m) => [m.code],
    request: ([code]) => ({ code }),
    filter: (m, [code]) => m.code === code,
  });
  await validator({
    fields: ["message.source"],
    values: (m) => [m.source],
    request: ([source]) => ({ source }),
    filter: (m, [source]) => m.source === source,
  });
  await validator({
    fields: ["message.target"],
    values: (m) => [m.target],
    request: ([target]) => ({ target }),
    filter: (m, [target]) => m.target === target,
  });
  await validator({
    fields: ["content.title"],
    values: (m) => [m.content.title],
    request: ([title]) => ({ content: { title } }),
    filter: (m, [title]) => m.content.title.includes(title),
  });
  await validator({
    fields: ["content.body"],
    values: (m) => [m.content.body],
    request: ([body]) => ({ content: { body } }),
    filter: (m, [body]) => m.content.body.includes(body),
  });
  await validator({
    fields: ["content.title_or_body"],
    values: (m) => [Math.random() < 0.5 ? m.content.title : m.content.body],
    request: ([title_or_body]) => ({ content: { title_or_body } }),
    filter: (m, [title_or_body]) =>
      m.content.title.includes(title_or_body) ||
      m.content.body.includes(title_or_body),
  });
};
