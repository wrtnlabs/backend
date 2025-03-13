import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { generate_random_channel } from "./internal/generate_random_channel";

export const test_api_hub_systematic_channel_store = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);

  const channel: IHubChannel = await generate_random_channel(pool);
  const read: IHubChannel.IHierarchical =
    await HubApi.functional.hub.admins.systematic.channels.at(
      pool.admin,
      channel.id,
    );
  TestValidator.equals("create")(channel)(read);
};
