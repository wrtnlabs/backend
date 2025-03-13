import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { DummyChatListener } from "./internal/DummyChatListener";

export const test_api_studio_meta_chat_session_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  await ArrayUtil.asyncRepeat(5)(async () => {
    const { connector, driver } =
      await HubApi.functional.studio.customers.meta.chat.sessions.start(
        pool.customer,
        {},
        new DummyChatListener(),
      );
    await driver.initialize();
    await driver.talk({
      type: "text",
      text: "Hello",
    });
    await connector.close();
  });

  await ArrayUtil.asyncRepeat(5)(async () => {
    const { connector, driver } =
      await HubApi.functional.studio.customers.meta.chat.sessions.start(
        pool.customer,
        {},
        new DummyChatListener(),
      );
    await driver.initialize();
    await connector.close();
  });

  const entire: IPage<IStudioMetaChatSession> =
    await HubApi.functional.studio.customers.meta.chat.sessions.index(
      pool.customer,
      {
        limit: 100,
        sort: ["+session.created_at"],
      },
    );
  const search = TestValidator.search("search")(
    async (search: IStudioMetaChatSession.IRequest.ISearch) => {
      const page: IPage<IStudioMetaChatSession> =
        await HubApi.functional.studio.customers.meta.chat.sessions.index(
          pool.customer,
          {
            limit: 100,
            search,
          },
        );
      return page.data;
    },
  )(entire.data);

  await search({
    fields: ["from"],
    values: (m) => [m.created_at],
    request: ([from]) => ({ from }),
    filter: (m, [from]) =>
      new Date(from).getTime() <= new Date(m.created_at).getTime(),
  });
  await search({
    fields: ["to"],
    values: (m) => [m.created_at],
    request: ([to]) => ({ to }),
    filter: (m, [to]) =>
      new Date(m.created_at).getTime() <= new Date(to).getTime(),
  });
  await search({
    fields: ["from", "to"],
    values: (m) => [
      new Date(new Date(m.created_at).getTime() - 250).toISOString(),
      new Date(new Date(m.created_at).getTime() + 250).toISOString(),
    ],
    request: ([from, to]) => ({
      from,
      to,
    }),
    filter: (m, [from, to]) =>
      new Date(from).getTime() <= new Date(m.created_at).getTime() &&
      new Date(m.created_at).getTime() <= new Date(to).getTime(),
  });
};
