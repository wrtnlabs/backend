import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSaleCollection } from "@wrtnlabs/os-api/lib/structures/hub/sales/collections/IHubSaleCollection";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale_collection } from "./internal/generate_random_sale_collection";

export const test_api_hub_sale_collection_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_create(pool);
  await test_api_hub_seller_join(pool);
  await test_api_hub_admin_login(pool);

  await ArrayUtil.asyncRepeat(9)(async () => {
    await generate_random_sale_collection(pool);
  });

  const total: IPage<IHubSaleCollection.ISummary> =
    await HubApi.functional.hub.customers.sales.collections.index(pool.admin, {
      limit: REPEAT,
      sort: ["+created_at"],
    });

  const validator = TestValidator.sort("sales.packages.index")<
    IHubSaleCollection.ISummary,
    IHubSaleCollection.IRequest.SortableColumns,
    IPage.Sort<IHubSaleCollection.IRequest.SortableColumns>
  >(async (input) => {
    const page: IPage<IHubSaleCollection.ISummary> =
      await HubApi.functional.hub.customers.sales.collections.index(
        pool.admin,
        {
          limit: total.data.length,
          sort: input,
        },
      );
    return page.data;
  });

  const components = [
    validator("created_at")(
      GaffComparator.dates((collection) => collection.created_at),
    ),
  ];

  for (const cmp of components) {
    await cmp("+");
    await cmp("-");
  }
};
const REPEAT = 9;
