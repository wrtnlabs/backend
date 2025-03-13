import { ArrayUtil, TestValidator } from "@nestia/e2e";
import HubApi from "@wrtnlabs/os-api";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import fs from "fs";
import path from "path";

import { HubConfiguration } from "../../../../../src/HubConfiguration";
import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "../orders/internal/generate_random_order";
import { generate_random_order_publish } from "../orders/internal/generate_random_order_publish";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_sale_question } from "../sales/internal/generate_random_sale_question";
import { generate_random_sale_review } from "../sales/internal/generate_random_sale_review";

export const test_api_hub_statistics_sale_snapshot_inquiry = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  await ArrayUtil.asyncRepeat(10)(async () => {
    await test_api_hub_customer_join(pool);
    await generate_random_sale_question(pool, sale);
  });
  await ArrayUtil.asyncRepeat(10)(async () => {
    await test_api_hub_customer_join(pool);
    const commodity: IHubCartCommodity = await generate_random_cart_commodity(
      pool,
      sale,
    );
    const order: IHubOrder = await generate_random_order(pool, [commodity]);
    order.publish = await generate_random_order_publish(pool, order);

    await generate_random_sale_review(pool, order.goods[0], {
      score: Math.random() > 0.5 ? 4 : 3,
    });
  });

  await refreshMaterializedViews();
  const record: IHubSale = await HubApi.functional.hub.customers.sales.at(
    pool.customer,
    sale.id,
  );

  TestValidator.equals("question_count")(10)(
    record.aggregate.inquiry.question.count,
  );
  TestValidator.equals("review_count")(10)(
    record.aggregate.inquiry.review.count,
  );
};

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
