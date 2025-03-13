import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioMetaChatServiceTokenUsage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceTokenUsage";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { DummyChatListener } from "./internal/DummyChatListener";

export const test_api_studio_meta_chat_session_token_usage = async (
  pool: ConnectionPool,
): Promise<void> => {
  // CREATE A SESSION
  await test_api_hub_customer_join(pool);

  const { connector } =
    await HubApi.functional.studio.customers.meta.chat.sessions.start(
      pool.customer,
      {},
      new DummyChatListener({}),
    );

  try {
    const usage: IStudioMetaChatServiceTokenUsage = await connector
      .getDriver()
      .getTokenUsage();
    typia.assert(usage);
  } catch (exp) {
    throw exp;
  } finally {
    await connector.close();
  }
};
