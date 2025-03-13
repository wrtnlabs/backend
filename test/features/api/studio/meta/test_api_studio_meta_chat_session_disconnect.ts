import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { DummyChatListener } from "./internal/DummyChatListener";

export const test_api_studio_meta_chat_session_disconnect = async (
  pool: ConnectionPool,
): Promise<void> => {
  // CREATE A SESSION
  await test_api_hub_customer_join(pool);
  const first =
    await HubApi.functional.studio.customers.meta.chat.sessions.start(
      pool.customer,
      {},
      new DummyChatListener(),
    );
  const session: IStudioMetaChatSession = await first.driver.initialize();

  // RETRY BEFORE FAKE DISCONNECTION
  await TestValidator.error("already connected problem")(() =>
    HubApi.functional.studio.customers.meta.chat.sessions.restart(
      pool.customer,
      session.id,
      {},
      new DummyChatListener(),
    ),
  );

  // DO FAKE DISCONNECT
  await HubApi.functional.studio.customers.meta.chat.sessions.disconnect(
    pool.customer,
    session.id,
  );

  // RETRY AND SUCCESS
  const again =
    await HubApi.functional.studio.customers.meta.chat.sessions.restart(
      pool.customer,
      session.id,
      {},
      new DummyChatListener(),
    );
  await again.driver.initialize();
  await again.connector.close();
  await first.connector.close();
};
