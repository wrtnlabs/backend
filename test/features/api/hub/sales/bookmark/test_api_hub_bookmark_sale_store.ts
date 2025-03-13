import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubBookmarkSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/bookmarks/IHubBookmarkSale";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../internal/generate_random_sale";

export const test_api_hub_bookmark_sale_store = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(
    pool,
    "approved",
    undefined,
  );

  const bookmark: IHubBookmarkSale =
    await HubApi.functional.hub.customers.sales.bookmark.create(
      pool.customer,
      sale.id,
    );

  const bookmarkedSale: IHubSale =
    await HubApi.functional.hub.customers.sales.at(pool.customer, sale.id);

  TestValidator.equals("bookmarked_at")(bookmarkedSale.bookmarked_at)(
    bookmark.created_at,
  );

  const total: IPage<IHubSale.ISummary> =
    await HubApi.functional.hub.customers.sales.index(pool.customer, {
      limit: 10,
      sort: ["-sale.created_at"],
    });

  TestValidator.equals("index")(
    total.data.find((s) => s.bookmarked_at !== null)?.id,
  )(bookmark.sale.id);

  const saleList: IPage<IHubSale.ISummary> =
    await HubApi.functional.hub.customers.sales.index(pool.customer, {
      limit: 10,
      sort: ["-sale.created_at"],
    });

  TestValidator.equals("index")(
    saleList.data.find((s) => s.bookmarked_at === bookmark.created_at)
      ?.bookmarked_at,
  )(bookmark.created_at);

  await HubApi.functional.hub.customers.sales.bookmark.erase(
    pool.customer,
    sale.id,
  );

  const deleteBookmarkSale: IHubSale =
    await HubApi.functional.hub.customers.sales.at(pool.customer, sale.id);
  TestValidator.equals("index")(deleteBookmarkSale.bookmarked_at)(null);
};
