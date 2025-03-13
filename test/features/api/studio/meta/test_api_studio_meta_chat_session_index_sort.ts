import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { DummyChatListener } from "./internal/DummyChatListener";

export const test_api_studio_meta_chat_session_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  await ArrayUtil.asyncRepeat(10)(async () => {
    const { connector, driver } =
      await HubApi.functional.studio.customers.meta.chat.sessions.start(
        pool.customer,
        {},
        new DummyChatListener(),
      );
    await driver.initialize();
    await driver.talk({
      type: "text",
      text: "Hello",
    });
    await connector.close();
  });

  const validator = TestValidator.sort("sessions")<
    IStudioMetaChatSession,
    IStudioMetaChatSession.IRequest.SortableColumns,
    IPage.Sort<IStudioMetaChatSession.IRequest.SortableColumns>
  >(async (sort) => {
    const page: IPage<IStudioMetaChatSession> =
      await HubApi.functional.studio.customers.meta.chat.sessions.index(
        pool.customer,
        {
          limit: 100,
          sort,
        },
      );
    return page.data;
  });
  const components = [
    validator("session.created_at")(GaffComparator.dates((x) => x.created_at)),
    validator("session.updated_at")(GaffComparator.dates((x) => x.updated_at)),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};
