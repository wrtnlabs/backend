import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { generate_random_channel } from "./internal/generate_random_channel";

export const test_api_hub_systematic_channel_merge = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);

  const prefix: string = RandomGenerator.alphabets(8);
  const channelList: IHubChannel[] = await ArrayUtil.asyncRepeat(REPEAT)(() =>
    generate_random_channel(pool, {
      code: `${prefix}_${RandomGenerator.alphabets(8)}`,
    }),
  );

  await HubApi.functional.hub.admins.systematic.channels.merge(pool.admin, {
    keep: channelList[0].id,
    absorbed: channelList.slice(1).map((c) => c.id),
  });

  const page: IPage<IHubChannel> =
    await HubApi.functional.hub.admins.systematic.channels.index(pool.admin, {
      limit: REPEAT,
      search: {
        code: `${prefix}_`,
      },
    });
  TestValidator.equals("merge")([channelList[0]])(page.data);
};

const REPEAT = 4;
