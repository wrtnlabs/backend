import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";
import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { generate_random_channel } from "./internal/generate_random_channel";

export const test_api_hub_systematic_channel_category_update = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);

  const channel: IHubChannel = await generate_random_channel(pool);
  const generate = async (
    parent: IHubChannelCategory.IForAdmin | null,
  ): Promise<IHubChannelCategory.IForAdmin> => {
    const child: IHubChannelCategory.IForAdmin =
      await HubApi.functional.hub.admins.systematic.channels.categories.create(
        pool.admin,
        channel.code,
        {
          parent_id: parent?.id ?? null,
          lang_names: [
            {
              name: RandomGenerator.name(8),
              lang_code: "en",
            },
          ],
          background_image_url: "https://picsum.photos/200/300?random",
          background_color: "pink",
        },
      );
    return child;
  };
  const left: IHubChannelCategory.IForAdmin = await generate(null);
  const right: IHubChannelCategory.IForAdmin = await generate(null);
  const child: IHubChannelCategory.IForAdmin = await generate(left);
  const update = RandomGenerator.name(8);

  await HubApi.functional.hub.admins.systematic.channels.categories.update(
    pool.admin,
    channel.code,
    child.id,
    {
      parent_id: right.id,
      lang_names: [
        { name: "테테스트", lang_code: "ko" },
        { name: update, lang_code: "en" },
      ],
    },
  );

  const expected: Rough[] = [
    {
      name: left.name[0].name,
      children: [] as Rough[],
    },
    {
      name: right.name[0].name,
      children: [
        {
          name: update,
          children: [] as Rough[],
        },
      ],
    },
  ];
  const entire: IHubChannelCategory.IHierarchical[] =
    await HubApi.functional.hub.admins.systematic.channels.categories.index(
      pool.admin,
      channel.code,
    );
  TestValidator.equals("update")(expected)(entire);
};

interface Rough {
  name: string;
  children: Rough[];
}
