import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { StudioMetaChatSessionStorageProvider } from "../../../src/providers/studio/meta/StudioMetaChatSessionStorageProvider";

import { ConnectionPool } from "../../ConnectionPool";
import { test_api_hub_customer_join } from "../api/hub/actors/test_api_hub_customer_join";

export const test_provider_studio_meta_chat_session_storage = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  const session: IStudioMetaChatSession =
    await HubApi.functional.studio.customers.meta.chat.sessions.create(
      pool.customer,
      {},
    );
  await StudioMetaChatSessionStorageProvider.emplace({
    session,
    data: {
      id: 1,
    },
  });

  const data: any = await StudioMetaChatSessionStorageProvider.get({
    session,
  });
  typia.assertEquals<{ id: 1 }>(data);

  await StudioMetaChatSessionStorageProvider.emplace({
    session,
    data: {
      id: 2,
      name: "John Doe",
    },
  });
  typia.assertEquals<{ id: 2; name: "John Doe" }>(
    await StudioMetaChatSessionStorageProvider.get({
      session,
    }),
  );
};
