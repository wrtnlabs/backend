import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { HubConfiguration } from "../../../../../src/HubConfiguration";
import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { DummyChatListener } from "./internal/DummyChatListener";

export const test_api_studio_meta_chat_session_chatting_limit_with_init =
  async (pool: ConnectionPool): Promise<boolean> => {
    /**
     * required --mock_llm false
     */
    if (HubGlobal.mock === true) return false;

    await test_api_hub_customer_join(pool, pool.customer, {
      email: `customer-${RandomGenerator.alphaNumeric(16)}@gmail.com`,
    });

    // Start initial chat session
    const { connector } =
      await HubApi.functional.studio.customers.meta.chat.sessions.start(
        pool.customer,
        {},
        new DummyChatListener(),
      );
    await connector.getDriver().initialize();
    // Send messages up to the limit
    const consume = async (i: number) => {
      await connector.getDriver().talk({
        type: "text",
        text: `Test message ${i}`,
      });
    };
    for (let i = 0; i < HubConfiguration.freeTalkingLimit.get(); i++) {
      await consume(i);
    }
    await connector.close();

    // Try again -> exhausted
    const { connector: realConnector } =
      await HubApi.functional.studio.customers.meta.chat.sessions.start(
        pool.customer,
        { mock: false },
        new DummyChatListener(),
      );

    await realConnector
      .getDriver()
      .initialize()
      .then(() => {
        throw new Error("expected talk count overflow errors");
      })
      .catch((e) => {
        if ("name" in e && e.name === "ExceededChatLimitError") {
          return;
        }
        throw new Error("expected talk count overflow errors");
      })
      .finally(() => realConnector.close());
    return true;
  };
