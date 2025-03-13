import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";
import { sleep_for } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";
import { IStudioMetaChatSessionConnection } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionConnection";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { DummyChatListener } from "./internal/DummyChatListener";

export const test_api_studio_meta_chat_session_connection_index_sort = async (
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

  const validator = TestValidator.sort("connections")<
    IStudioMetaChatSessionConnection,
    IStudioMetaChatSessionConnection.IRequest.SortableColumns,
    IPage.Sort<IStudioMetaChatSessionConnection.IRequest.SortableColumns>
  >(async (input) => {
    const page: IPage<IStudioMetaChatSessionConnection> =
      await HubApi.functional.studio.customers.meta.chat.sessions.connections.index(
        pool.customer,
        session.id,
        {
          limit: 100,
          sort: input,
        },
      );
    return page.data;
  });
  const components = [
    validator("connection.connected_at")(
      GaffComparator.dates((x) => x.connected_at),
    ),
    validator("connection.disconnected_at")(
      GaffComparator.dates((x) => x.disconnected_at ?? "9999-12-31"),
    ),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};
