import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubPushMessage } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessage";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";

export const test_api_hub_push_message_create = async (
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
  const read: IHubPushMessage =
    await HubApi.functional.hub.admins.push_messages.at(pool.admin, message.id);
  TestValidator.equals("read")(read)(message);

  await HubApi.functional.hub.admins.push_messages.erase(
    pool.admin,
    message.id,
  );
};
