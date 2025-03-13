import { ArrayUtil, TestValidator } from "@nestia/e2e";
import fs from "fs";
import path from "path";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSaleRecommend } from "@wrtnlabs/os-api/lib/structures/hub/sales/recommend/IHubSaleRecommend";

import { HubConfiguration } from "../../../../../../src/HubConfiguration";
import { HubGlobal } from "../../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../internal/generate_random_sale";

export const test_api_hub_sale_recommend_index_search = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_create(pool);

  await refreshMaterializedViews();

  const first: IPage<IHubSaleRecommend> =
    await HubApi.functional.hub.customers.sales.recommendations.index(
      pool.customer,
      {
        limit: REPEAT,
        sort: ["-sale.view_count"],
      },
    );

  const sales = await ArrayUtil.asyncRepeat(25)(async () => {
    await test_api_hub_seller_join(pool);
    return await generate_random_sale(pool, "approved");
  });

  await ArrayUtil.asyncRepeat(
    first.data[0].aggregate.view.total_view_count + 5,
  )(async () => {
    await HubApi.functional.hub.customers.sales.at(pool.customer, sales[0].id);
  });

  await refreshMaterializedViews();

  const total: IPage<IHubSaleRecommend> =
    await HubApi.functional.hub.customers.sales.recommendations.index(
      pool.customer,
      {
        limit: REPEAT,
        sort: ["-sale.view_count"],
      },
    );
  TestValidator.equals("ranking")(total.data[0].id)(sales[0].id);
};
const REPEAT = 25;

const refreshMaterializedViews = async (): Promise<void> => {
  const directory = `${HubConfiguration.ROOT}/src/setup/views`;
  for (const file of await fs.promises.readdir(directory)) {
    if (!file.endsWith(".sql")) continue;

    const filenameWithoutExtension = path.basename(file, ".sql");

    await HubGlobal.prisma.$executeRawUnsafe(
      `REFRESH MATERIALIZED VIEW CONCURRENTLY hub.${filenameWithoutExtension};`,
    );
  }
};
