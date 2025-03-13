import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSaleContent } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleContent";

import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";

export const test_api_hub_sale_content_translate = async (
  pool: ConnectionPool,
): Promise<boolean> => {
  if (HubGlobal.env.GOOGLE_APPLICATION_CREDENTIALS === undefined) return false;

  await test_api_hub_seller_join(pool);
  const input: IHubSaleContent.ICreate = {
    lang_code: "en",
    original: true,
    format: "md",
    title: "Hello World",
    summary:
      "Hello world, here is the summary description of the sale content.",
    body: [
      "Hello world",
      "",
      "Here is the detailed body description of the sale content.",
      "",
      "In here property, you have to write long detailed description of the",
      "sale content, including purposes of the API, and detailed guidelines",
      "how to utilize the API endpoints.",
    ].join("\n"),
    version_description: "The first version",
    tags: ["Github", "E-Commerce", "API"],
    icons: [
      {
        name: "icon1",
        extension: "png",
        url: "https://typia.io/favicon/android-chrome-192x192.png",
      },
    ],
    thumbnails: [],
    files: [],
  };
  const translated: IHubSaleContent.ICreate =
    await HubApi.functional.hub.sellers.sales.contents.translate(
      pool.seller,
      "ko",
      input,
    );
  TestValidator.error("translated content")(() =>
    TestValidator.equals("different language")(input)(translated),
  );
  return true;
};
