import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubPushMessage } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessage";
import { IHubPushMessageContent } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessageContent";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";

export const test_api_hub_push_message_update = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);

  const message: IHubPushMessage =
    await HubApi.functional.hub.admins.push_messages.create(pool.admin, {
      code: RandomGenerator.alphabets(16),
      source: RandomGenerator.alphabets(16),
      target: "customer",
      content: {
        title: "something",
        body: "nothing",
      },
    });
  const content: IHubPushMessageContent =
    await HubApi.functional.hub.admins.push_messages.update(
      pool.admin,
      message.id,
      {
        title: "something else",
        body: "nothing else",
      },
    );
  const read: IHubPushMessage =
    await HubApi.functional.hub.admins.push_messages.at(pool.admin, message.id);
  TestValidator.equals("read")(read)({
    ...message,
    content,
  });
};
