import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { DummyChatListener } from "./internal/DummyChatListener";

export const test_api_studio_meta_chat_session_index_sort_pinned = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  await ArrayUtil.asyncRepeat(10)(async (i) => {
    const { connector, driver } =
      await HubApi.functional.studio.customers.meta.chat.sessions.start(
        pool.customer,
        {},
        new DummyChatListener(),
      );
    const session: IStudioMetaChatSession = await connector
      .getDriver()
      .initialize();
    await driver.talk({
      type: "text",
      text: "Hello",
    });
    await connector.close();

    if (i < 5)
      await HubApi.functional.studio.customers.meta.chat.sessions.pin(
        pool.customer,
        session.id,
      );
  });

  const validate = async (pinned: boolean) => {
    const page: IPage<IStudioMetaChatSession> =
      await HubApi.functional.studio.customers.meta.chat.sessions.index(
        pool.customer,
        {
          pinned,
        },
      );
    TestValidator.equals(`pinned ${pinned}`)(5)(page.data.length);
  };
  await validate(false);
  await validate(true);
};
