import { ArrayUtil, TestValidator } from "@nestia/e2e";
import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";
import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../sales/internal/generate_random_sale";

export const test_api_hub_systematic_channel_category_merge = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  const channel: IHubChannel =
    await HubApi.functional.hub.admins.systematic.channels.get(
      pool.admin,
      pool.channel,
    );
  const rough: Rough = prepare({ level: 0, index: 0 });
  const record = await generate(pool, channel, null, rough);
  const top: IHubChannelCategory.IHierarchical = {
    ...record,
    name: record.name[0].name,
  };

  const sale: IHubSale = await generate_random_sale(pool, "approved", {
    category_ids: top.children.map((c) => c.id),
  });

  await HubApi.functional.hub.admins.systematic.channels.categories.merge(
    pool.admin,
    channel.code,
    {
      keep: top.children[0].id,
      absorbed: top.children.slice(1).map((c) => c.id),
    },
  );

  const expected: Rough = {
    name: "0",
    children: [
      {
        name: "0",
        children: ArrayUtil.repeat(REPEAT)((i) => ({
          name: i.toString(),
          children: [],
        })),
      },
    ],
  };

  const reloaded: IHubSale = await HubApi.functional.hub.admins.sales.at(
    pool.admin,
    sale.id,
  );
  TestValidator.equals("sale.channels[].categories")(
    expected.children.map((c) => ({
      name: c.name,
    })),
  )(reloaded.categories);

  const entire: IHubChannelCategory.IHierarchical[] =
    await HubApi.functional.hub.admins.systematic.channels.categories.index(
      pool.admin,
      channel.code,
    );
  TestValidator.equals("categories")([expected])(entire);
};

interface Rough {
  name: string;
  children: Rough[];
}
const prepare = (props: { level: number; index: number }): Rough => ({
  name: props.index.toString(),
  children:
    props.level < 2
      ? ArrayUtil.repeat(REPEAT)((j) =>
          prepare({
            level: props.level + 1,
            index: j,
          }),
        )
      : [],
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
const REPEAT = 4;
