import { TestValidator } from "@nestia/e2e";

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

export const test_api_studio_meta_chat_session_create_of_specific = async (
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
  const read: IStudioMetaChatSession =
    await HubApi.functional.studio.customers.meta.chat.sessions.at(
      pool.customer,
      session.id,
    );
  TestValidator.equals(
    "session",
    (key) =>
      key === "disconnected_at" ||
      key === "last_message" ||
      key === "updated_at",
  )(session)(read);

  const expected: IPage<IStudioMetaChatSessionMessage> =
    await HubApi.functional.studio.customers.meta.chat.sessions.messages.index(
      pool.customer,
      session.id,
      {
        limit: 9999,
        sort: ["+message.created_at"],
      },
    );
  const mid: number = Math.floor(expected.data.length / 2);

  const share: IStudioMetaChatSessionShare =
    await HubApi.functional.studio.customers.meta.chat.sessions.shares.create(
      pool.customer,
      {
        title: "Test Title",
        session_id: session.id,
        message_id: expected.data[mid].id,
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
  TestValidator.equals("messages")(expected.data[mid].id)(
    actual.data.at(-1)?.id ?? "",
  );
};
