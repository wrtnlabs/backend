// import { TestValidator } from "@nestia/e2e";
import { TestValidator } from "@nestia/e2e";
import { sleep_for } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { DummyChatListener } from "./internal/DummyChatListener";

export const test_api_studio_meta_chat_session_connect_at_the_same_time =
  async (pool: ConnectionPool): Promise<void> => {
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
    const connect = async (ms: number): Promise<void> => {
      const { connector } =
        await HubApi.functional.studio.customers.meta.chat.sessions.restart(
          pool.customer,
          session.id,
          {},
          new DummyChatListener(),
        );
      await connector.getDriver().initialize();
      await sleep_for(ms);
      await connector.close();
    };
    const first = connect(500);
    await sleep_for(50);
    await TestValidator.error("duplicated connection")(() => connect(50));
    await first;
  };
