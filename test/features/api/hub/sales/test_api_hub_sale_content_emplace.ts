import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleContent } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleContent";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "./internal/generate_random_sale";

export const test_api_hub_sale_content_emplace = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
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
  const sale: IHubSale = await generate_random_sale(pool, "approved", {
    contents: [input],
  });

  await HubApi.functional.hub.customers.authenticate.update(pool.seller, {
    lang_code: "ko",
  });

  const read: IHubSale = await HubApi.functional.hub.sellers.sales.at(
    pool.seller,
    sale.id,
  );
  TestValidator.error("emplaced")(() =>
    TestValidator.equals("emplaced content")(sale.content)(read.content),
  );
};
