import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleContent } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleContent";

import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "./internal/generate_random_sale";

export const test_api_hub_sale_content_index = async (
  pool: ConnectionPool,
): Promise<boolean> => {
  if (HubGlobal.env.GOOGLE_APPLICATION_CREDENTIALS === undefined) return false;

  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  const english: IHubSaleContent.ICreate = {
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
  const contents: IHubSaleContent.ICreate[] = [
    english,
    ...(await ArrayUtil.asyncMap(["ko", "ja", "ar"])((langCode) =>
      HubApi.functional.hub.sellers.sales.contents.translate(
        pool.seller,
        langCode,
        english,
      ),
    )),
  ].sort((a, b) => a.lang_code!.localeCompare(b.lang_code!));

  const sale: IHubSale = await generate_random_sale(pool, "approved", {
    contents,
  });
  const page: IPage<IHubSaleContent> =
    await HubApi.functional.hub.customers.sales.contents.index(
      pool.admin,
      sale.id,
      {
        limit: contents.length,
      },
    );
  TestValidator.equals("translated")(contents)(
    page.data.sort((a, b) => a.lang_code.localeCompare(b.lang_code)),
  );
  return true;
};
