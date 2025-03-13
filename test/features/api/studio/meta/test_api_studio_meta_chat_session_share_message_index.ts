import { TestValidator } from "@nestia/e2e";
import { sleep_for } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";
import { IStudioMetaChatSessionMessage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionMessage";
import { IStudioMetaChatSessionShare } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionShare";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "../accounts/internal/generate_random_account";
import { validate_api_studio_meta_chat_session } from "./internal/validate_api_studio_meta_chat_session";

export const test_api_studio_meta_chat_session_share_message_index = async (
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
  await sleep_for(100); // for event archiving

  const expected: IPage<IStudioMetaChatSessionMessage> =
    await HubApi.functional.studio.customers.meta.chat.sessions.messages.index(
      pool.customer,
      session.id,
      {
        limit: 9999,
        sort: ["+message.created_at"],
      },
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
  const actual: IPage<IStudioMetaChatSessionMessage> =
    await HubApi.functional.studio.customers.meta.chat.sessions.shares.messages.index(
      pool.customer,
      share.id,
      {
        limit: 9999,
        sort: ["+message.created_at"],
      },
    );
  TestValidator.equals("messages")(expected.data)(actual.data);
};
