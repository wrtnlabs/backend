import { ArrayUtil } from "@nestia/e2e";
import fs from "fs";
import typia from "typia";

import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";
import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";

import { HubChannelCategoryProvider } from "../../providers/hub/systematic/HubChannelCategoryProvider";
import { HubChannelProvider } from "../../providers/hub/systematic/HubChannelProvider";

import { HubConfiguration } from "../../HubConfiguration";

export namespace HubChannelSeeder {
  export const seed = async (): Promise<void> => {
    const dict: Map<string, IHierarchy> = new Map();
    for (const input of CHANNELS) await seedChannel(dict)(input);
    await seedCategories(dict);
  };

  const seedChannel =
    (dict: Map<string, IHierarchy>) =>
    async (input: IHubChannel.ICreate): Promise<void> => {
      const channel: IHubChannel = await HubChannelProvider.create(input);
      dict.set(channel.code, { channel, last: [] });
    };

  const seedCategories = async (
    dict: Map<string, IHierarchy>,
  ): Promise<void> => {
    const categoriesRaw: string = await fs.promises.readFile(
      `${HubConfiguration.ROOT}/assets/raw/raw_channel_categories.json`,
      "utf8",
    );

    const input: IRawCategory[] = JSON.parse(categoriesRaw);

    await ArrayUtil.asyncMap(input)(async (raw, i) => {
      const koName = raw.lang_names.find((n) => n.lang_code === "ko")?.name;
      if (!koName) {
        throw new Error(
          `Korean name not found for category at line: ${i + 1}.`,
        );
      }

      const [_name, level] = getLevel(koName);
      const hierarchy: IHierarchy | undefined = dict.get(raw.channel);
      if (hierarchy === undefined)
        throw new Error(`Unable to find the channel record at line: ${i + 1}.`);

      const parent: IHubChannelCategory | null = (() => {
        if (level === 0) return null;

        const parent = dict.get(raw.channel)?.last[level - 1];
        if (parent === undefined)
          throw new Error(
            `Unable to find the parent category at line: ${i + 1}.`,
          );
        return parent;
      })();

      const category: IHubChannelCategory.IForAdmin =
        await HubChannelCategoryProvider.create({
          admin: null,
          channel: hierarchy.channel,
          input: {
            parent_id: parent?.id ?? null,
            lang_names: raw.lang_names,
            background_image_url: raw.background_image_url,
            background_color: typia.assert<IHubChannelCategory.BackgroundColor>(
              raw.background_color,
            ),
          },
        });
      hierarchy.last[level] = {
        ...category,
        name: category.name[0].name,
      };
    });
  };

  const getLevel = (name: string): [string, number] => {
    // eslint-disable-next-line
    let spaces: number = 0;
    while (name[spaces] === " ") ++spaces;
    return [name.slice(spaces), spaces / 2];
  };
}

const CHANNELS: IHubChannel.ICreate[] = [
  {
    code: "wrtn",
    name: "Wrtn Technologies",
  },
];

interface IHierarchy {
  channel: IHubChannel;
  last: IHubChannelCategory[];
}

interface IRawCategory {
  channel: string;
  lang_names: {
    name: string;
    lang_code: string;
  }[];
  background_color: string;
  background_image_url: string;
}
