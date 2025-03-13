import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";
import { IStudioMetaChatSessionShare } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionShare";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "../accounts/internal/generate_random_account";
import { validate_api_studio_meta_chat_session } from "./internal/validate_api_studio_meta_chat_session";

export const test_api_studio_meta_chat_session_share_update = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool);
  const session: IStudioMetaChatSession =
    await validate_api_studio_meta_chat_session(pool, account, (provider) =>
      HubApi.functional.studio.customers.meta.chat.sessions.start(
        pool.customer,
        {},
        provider,
      ),
    );
  const share: IStudioMetaChatSessionShare =
    await HubApi.functional.studio.customers.meta.chat.sessions.shares.create(
      pool.customer,
      {
        title: "Test Title",
        session_id: session.id,
        message_id: null,
      },
    );
  await HubApi.functional.studio.customers.meta.chat.sessions.shares.update(
    pool.customer,
    share.id,
    {
      title: "Updated Title",
    },
  );
  const read: IStudioMetaChatSessionShare =
    await HubApi.functional.studio.customers.meta.chat.sessions.shares.at(
      pool.customer,
      share.id,
    );
  TestValidator.equals("share.title")(read.title)("Updated Title");
};
