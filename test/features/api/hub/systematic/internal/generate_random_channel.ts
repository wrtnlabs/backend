import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_channel = async (
  pool: ConnectionPool,
  input?: Partial<IHubChannel.ICreate>,
): Promise<IHubChannel> => {
  const channel: IHubChannel =
    await HubApi.functional.hub.admins.systematic.channels.create(pool.admin, {
      code: RandomGenerator.alphabets(16),
      name: RandomGenerator.name(8),
      ...(input ?? {}),
    });
  return channel;
};
