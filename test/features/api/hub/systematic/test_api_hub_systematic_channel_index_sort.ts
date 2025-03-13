import {
  ArrayUtil,
  GaffComparator,
  RandomGenerator,
  TestValidator,
} from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";

export const test_api_hub_systematic_channel_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await ArrayUtil.asyncRepeat(REPEAT)(async () => {
    const channel: IHubChannel =
      await HubApi.functional.hub.admins.systematic.channels.create(
        pool.admin,
        {
          code: RandomGenerator.alphabets(8),
          name: RandomGenerator.name(8),
        },
      );
    return channel;
  });

  const validator = TestValidator.sort("channels.index")<
    IHubChannel,
    IHubChannel.IRequest.SortableColumns,
    IPage.Sort<IHubChannel.IRequest.SortableColumns>
  >(async (input: IPage.Sort<IHubChannel.IRequest.SortableColumns>) => {
    const page: IPage<IHubChannel> =
      await HubApi.functional.hub.admins.systematic.channels.index(pool.admin, {
        limit: REPEAT,
        sort: input,
      });
    return page.data;
  });
  const components = [
    validator("channel.code")(GaffComparator.strings((s) => s.code)),
    validator("channel.name")(GaffComparator.strings((s) => s.name)),
    validator("channel.created_at")(
      GaffComparator.strings((s) => s.created_at),
    ),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};
const REPEAT = 25;
