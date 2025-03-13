import { ArrayUtil, TestValidator } from "@nestia/e2e";
import std from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { DummyChatListener } from "./internal/DummyChatListener";

export const test_api_studio_meta_chat_session_index_sort_pinned_is_undefined =
  async (pool: ConnectionPool): Promise<void> => {
    await test_api_hub_customer_join(pool);
    await ArrayUtil.asyncRepeat(10)(async (i) => {
      const { connector, driver } =
        await HubApi.functional.studio.customers.meta.chat.sessions.start(
          pool.customer,
          {},
          new DummyChatListener(),
        );
      const session: IStudioMetaChatSession = await driver.initialize();
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

    const page: IPage<IStudioMetaChatSession> =
      await HubApi.functional.studio.customers.meta.chat.sessions.index(
        pool.customer,
        {},
      );
    TestValidator.equals("sort")(true)(
      std.ranges.is_sorted(page.data, (x, y) =>
        !!x.pinned_at !== !!y.pinned_at
          ? Number(!!x.pinned_at) > Number(!!y.pinned_at)
          : x.pinned_at !== null
            ? x.pinned_at < y.pinned_at!
            : x.created_at > y.created_at,
      ),
    );
  };
