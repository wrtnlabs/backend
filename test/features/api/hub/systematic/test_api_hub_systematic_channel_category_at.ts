import { TestValidator } from "@nestia/e2e";
import fs from "fs";

import HubApi from "@wrtnlabs/os-api";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";

import { HubConfiguration } from "../../../../../src/HubConfiguration";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";

interface IRawCategory {
  channel: string;
  lang_names: {
    name: string;
    lang_code: string;
  }[];
  background_color: string;
  background_image_url: string;
}

export const test_api_hub_systematic_channel_category_at = async (
  pool: ConnectionPool,
) => {
  const categoryRaws: string = await fs.promises.readFile(
    `${HubConfiguration.ROOT}/assets/raw/raw_channel_categories.json`,
    "utf8",
  );
  const categories: IRawCategory[] = JSON.parse(categoryRaws);
  const koreanNames: string[] = categories
    .filter((c) => c.lang_names.some((l) => l.lang_code === "ko"))
    .map((c) => c.lang_names.find((l) => l.lang_code === "ko")?.name)
    .filter((name): name is string => name !== undefined)
    .sort((a, b) => a.localeCompare(b, "ko-KR"));
  const englishNames: string[] = categories
    .filter((c) => c.lang_names.some((l) => l.lang_code === "en"))
    .map((c) => c.lang_names.find((l) => l.lang_code === "en")?.name)
    .filter((name): name is string => name !== undefined)
    .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

  // LangCode: null
  await test_api_hub_customer_join(pool);
  const channelRaw =
    await HubApi.functional.hub.customers.systematic.channels.index(
      pool.customer,
      {
        search: {
          code: "wrtn",
        },
      },
    );
  const channelId = channelRaw.data[0].id;
  const nullRead: IHubChannel.IHierarchical =
    await HubApi.functional.hub.customers.systematic.channels.at(
      pool.customer,
      channelId,
    );
  TestValidator.equals("LangCode: null")(
    nullRead.categories
      .map((c) => c.name)
      .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
  )(englishNames);

  // LangCode: EN
  await test_api_hub_customer_join(pool, undefined, undefined, undefined, "en");
  const enRead: IHubChannel.IHierarchical =
    await HubApi.functional.hub.customers.systematic.channels.at(
      pool.customer,
      channelId,
    );
  TestValidator.equals("LangCode: EN")(
    enRead.categories
      .map((c) => c.name)
      .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
  )(englishNames);

  // LangCode: KO
  await test_api_hub_customer_join(pool, undefined, undefined, undefined, "ko");
  const koRead: IHubChannel.IHierarchical =
    await HubApi.functional.hub.customers.systematic.channels.at(
      pool.customer,
      channelId,
    );
  TestValidator.equals("LangCode: ko")(
    koRead.categories
      .map((c) => c.name)
      .sort((a, b) => a.localeCompare(b, "ko-KR")),
  )(koreanNames);

  // LangCode: ar
  await test_api_hub_customer_join(pool, undefined, undefined, undefined, "ar");
  const arRead: IHubChannel.IHierarchical =
    await HubApi.functional.hub.customers.systematic.channels.at(
      pool.customer,
      channelId,
    );
  TestValidator.equals("LangCode: ar")(
    arRead.categories
      .map((c) => c.name)
      .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
  )(englishNames);
};
