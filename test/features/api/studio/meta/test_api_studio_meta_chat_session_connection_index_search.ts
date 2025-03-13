import { ArrayUtil, TestValidator } from "@nestia/e2e";
import { sleep_for } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";
import { IStudioMetaChatSessionConnection } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionConnection";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { DummyChatListener } from "./internal/DummyChatListener";

export const test_api_studio_meta_chat_session_connection_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  const session: IStudioMetaChatSession = await (async () => {
    const { connector } =
      await HubApi.functional.studio.customers.meta.chat.sessions.start(
        pool.customer,
        {},
        new DummyChatListener(),
      );
    const session: IStudioMetaChatSession = await connector
      .getDriver()
      .initialize();
    await connector.close();
    return session;
  })();
  await ArrayUtil.asyncRepeat(9)(async () => {
    const { connector } =
      await HubApi.functional.studio.customers.meta.chat.sessions.restart(
        pool.customer,
        session.id,
        {},
        new DummyChatListener(),
      );
    await connector.getDriver().initialize();
    await connector.close();
  });
  await sleep_for(500);

  const entire: IPage<IStudioMetaChatSessionConnection> =
    await HubApi.functional.studio.customers.meta.chat.sessions.connections.index(
      pool.customer,
      session.id,
      {
        limit: 100,
        sort: ["+connection.connected_at"],
      },
    );
  const search = TestValidator.search("search")(
    async (search: IStudioMetaChatSessionConnection.IRequest.ISearch) => {
      const page: IPage<IStudioMetaChatSessionConnection> =
        await HubApi.functional.studio.customers.meta.chat.sessions.connections.index(
          pool.customer,
          session.id,
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
    values: (m) => [m.connected_at],
    request: ([from]) => ({ from }),
    filter: (m, [from]) =>
      new Date(from).getTime() <= new Date(m.connected_at).getTime(),
  });
  await search({
    fields: ["to"],
    values: (m) => [m.connected_at],
    request: ([to]) => ({ to }),
    filter: (m, [to]) =>
      new Date(m.connected_at).getTime() <= new Date(to).getTime(),
  });
  await search({
    fields: ["from", "to"],
    values: (m) => [
      new Date(new Date(m.connected_at).getTime() - 250).toISOString(),
      new Date(new Date(m.connected_at).getTime() + 250).toISOString(),
    ],
    request: ([from, to]) => ({
      from,
      to,
    }),
    filter: (m, [from, to]) =>
      new Date(from).getTime() <= new Date(m.connected_at).getTime() &&
      new Date(m.connected_at).getTime() <= new Date(to).getTime(),
  });
};
