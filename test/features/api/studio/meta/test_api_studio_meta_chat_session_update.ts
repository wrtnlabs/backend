import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { DummyChatListener } from "./internal/DummyChatListener";

export const test_api_studio_meta_chat_session_update = async (
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
  await HubApi.functional.studio.customers.meta.chat.sessions.update(
    pool.customer,
    session.id,
    {
      title: "New Title",
    },
  );

  const read: IStudioMetaChatSession =
    await HubApi.functional.studio.customers.meta.chat.sessions.at(
      pool.customer,
      session.id,
    );
  TestValidator.equals("title")(read.title)("New Title");
};
