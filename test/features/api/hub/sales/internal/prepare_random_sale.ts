import { ArrayUtil, RandomGenerator } from "@nestia/e2e";
import { IPointer, randint } from "tstl";

import HubApi from "@wrtnlabs/os-api";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { TestGlobal } from "../../../../../TestGlobal";
import { prepare_random_attachment_file } from "../../../common/prepare_random_attachment_file";
import { prepare_random_sale_unit } from "./prepare_random_sale_unit";

export const prepare_random_sale = async (
  pool: ConnectionPool,
  input?: Partial<IHubSale.ICreate>,
): Promise<IHubSale.ICreate> => ({
  section_code: TestGlobal.SECTION,
  category_ids: await categories(pool),
  units: ArrayUtil.repeat(randint(1, 3))(() => prepare_random_sale_unit()),
  contents: [
    {
      lang_code: "en",
      original: true,
      title: RandomGenerator.paragraph()(),
      summary: RandomGenerator.content()()(),
      body: RandomGenerator.content()()(),
      format: "txt",
      version_description: "Initial version",
      tags: [],
      files: ArrayUtil.repeat(randint(3, 10))(() =>
        prepare_random_attachment_file(),
      ),
      icons: ArrayUtil.repeat(randint(1, 3))(() =>
        prepare_random_attachment_file(),
      ),
      thumbnails: ArrayUtil.repeat(randint(1, 3))(() =>
        prepare_random_attachment_file(),
      ),
    },
  ],
  system_prompt: RandomGenerator.content()()(),
  user_prompt_examples: ArrayUtil.repeat(randint(1, 3))(() => ({
    value: RandomGenerator.paragraph()(),
    icon_url:
      Math.random() > 0.5 ? "https://picsum.photos/200/300?random" : null,
  })),
  opened_at: new Date().toISOString(),
  closed_at: null,
  version: `0.1.${minor.value++}`,
  ...(input ?? {}),
});

const categories = async (pool: ConnectionPool): Promise<string[]> => {
  const channel: IHubChannel.IHierarchical =
    await HubApi.functional.hub.sellers.systematic.channels.get(
      pool.seller,
      pool.channel,
    );
  return channel.categories.map((c) => c.id);
};

const minor: IPointer<number> = { value: 0 };
