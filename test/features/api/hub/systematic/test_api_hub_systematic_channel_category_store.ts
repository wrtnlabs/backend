import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { randint } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";
import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { generate_random_channel } from "./internal/generate_random_channel";

export const test_api_hub_systematic_channel_category_store = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);

  const channel: IHubChannel = await generate_random_channel(pool);
  const input: Rough = prepare(0);
  const category: IHubChannelCategory.IForAdmin = await generate(
    pool,
    channel,
    null,
    input,
  );
  TestValidator.equals("category")(input)({
    ...category,
    name: category.name[0].name,
  });
};

interface Rough {
  name: string;
  children: Rough[];
}
const prepare = (level: number): Rough => ({
  name: RandomGenerator.name(8),
  children:
    level < 2 ? ArrayUtil.repeat(randint(0, 3))(() => prepare(level + 1)) : [],
});
const generate = async (
  pool: ConnectionPool,
  channel: IHubChannel,
  parent_id: string | null,
  input: Rough,
): Promise<IHubChannelCategory.IForAdmin> => {
  const category: IHubChannelCategory.IForAdmin =
    await HubApi.functional.hub.admins.systematic.channels.categories.create(
      pool.admin,
      channel.code,
      {
        lang_names: [
          { name: input.name, lang_code: "ko" },
          { name: input.name, lang_code: "en" },
        ],
        parent_id,
        background_image_url: "https://picsum.photos/200/300?random",
        background_color: "yellow",
      },
    );
  category.children = await ArrayUtil.asyncMap(input.children)(
    async (child) => ({
      ...(await generate(pool, channel, category.id, child)),
      name: child.name,
    }),
  );
  return category;
};
