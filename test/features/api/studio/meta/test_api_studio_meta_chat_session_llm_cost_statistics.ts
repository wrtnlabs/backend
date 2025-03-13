import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioMetaChatServiceTokenUsage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceTokenUsage";

import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { DummyChatListener } from "./internal/DummyChatListener";

export const test_api_studio_meta_chat_session_llm_cost_statistics = async (
  pool: ConnectionPool,
): Promise<void> => {
  /**
   * requiried --mock_llm false
   */
  if (HubGlobal.mock === true) return;

  // Start initial chat session
  await test_api_hub_customer_join(pool, pool.customer, {
    email: `customer-${RandomGenerator.alphaNumeric(16)}@gmail.com`,
  });

  const stack: IStudioMetaChatServiceTokenUsage[] = [];
  const { connector } =
    await HubApi.functional.studio.customers.meta.chat.sessions.start(
      pool.customer,
      {},
      new DummyChatListener({
        tokenUsage: async (event) => {
          stack.push(event);
        },
      }),
    );

  await connector.getDriver().initialize();
  const consume = async (i: number) => {
    await connector.getDriver().talk({
      type: "text",
      text: `Test message ${i}`,
    });
  };

  // send messages.
  const repeat = 5 as const;
  for (let i = 0; i < repeat; i++) {
    await consume(i);
  }
  await connector.close();

  if (repeat !== stack.length) {
    throw new Error(`cost calculation works: ${stack.length}/${repeat}`);
  }
};
