import {
  ArrayUtil,
  GaffComparator,
  RandomGenerator,
  TestValidator,
} from "@nestia/e2e";
import fs from "fs";
import path from "path";
import { randint } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleReview } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleReview";

import { HubConfiguration } from "../../../../../src/HubConfiguration";
import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "../orders/internal/generate_random_order";
import { generate_random_order_publish } from "../orders/internal/generate_random_order_publish";
import { generate_random_sale } from "./internal/generate_random_sale";

// @todo NOT AGGREGATE YET
export const test_api_hub_sale_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);

  await ArrayUtil.asyncRepeat(25)(async () => {
    await test_api_hub_seller_join(pool);
    const sale: IHubSale = await generate_random_sale(pool, "approved");
    if (Math.random() < 0.25) return;

    const commodity: IHubCartCommodity = await generate_random_cart_commodity(
      pool,
      sale,
    );
    const order: IHubOrder = await generate_random_order(pool, [commodity]);
    if (Math.random() < 0.75)
      order.publish = await generate_random_order_publish(pool, order);

    if (order.publish !== null && Math.random() < 0.75) {
      const review: IHubSaleReview =
        await HubApi.functional.hub.customers.sales.reviews.create(
          pool.customer,
          sale.id,
          {
            good_id: order.goods[0].id,
            score: randint(0, 10) * 10,
            title: RandomGenerator.paragraph()(),
            body: RandomGenerator.content()()(),
            format: "md",
            files: [],
          },
        );
      review;
    }
  });

  const total: IPage<IHubSale.ISummary> =
    await HubApi.functional.hub.customers.sales.index(pool.customer, {
      limit: REPEAT,
      sort: ["-sale.view_count"],
    });

  const validator = TestValidator.sort("sales.index")<
    IHubSale.ISummary,
    IHubSale.IRequest.SortableColumns,
    IPage.Sort<IHubSale.IRequest.SortableColumns>
  >(async (input) => {
    const page: IPage<IHubSale.ISummary> =
      await HubApi.functional.hub.customers.sales.index(pool.customer, {
        limit: total.data.length,
        sort: input,
      });
    return page.data;
  });

  await ArrayUtil.asyncRepeat(
    total.data[0].aggregate.view.total_view_count + 5,
  )(async () => {
    await HubApi.functional.hub.customers.sales.at(
      pool.customer,
      total.data[0].id,
    );
  });

  await refreshMaterializedViews();

  const components = [
    // SALE
    validator("sale.closed_at")(
      GaffComparator.dates(
        (s) => s.closed_at ?? new Date("9999-12-31").toISOString(),
      ),
    ),
    validator("sale.opened_at")(
      GaffComparator.dates(
        (s) => s.opened_at ?? new Date("9999-12-31").toISOString(),
      ),
    ),
    validator("sale.created_at")(GaffComparator.dates((s) => s.created_at)),
    // SELLER
    validator("seller.created_at")(
      GaffComparator.dates((s) => s.seller.created_at),
    ),
    // @todo NOT AGGREGATE YET
    // validator("goods.publish_count")(
    //     GaffComparator.numbers((s) => s.aggregate.good.publish_count),
    // ),
    // validator("goods.payments")(
    //     GaffComparator.numbers(
    //         (s) => s.aggregate.good.variable + s.aggregate.good.fixed,
    //     ),
    // ),
    // validator("reviews.count")(
    //   GaffComparator.numbers((o) => o.aggregate.inquiry.review.count),
    // ),
    // validator("reviews.average")(
    //   GaffComparator.numbers(
    //     (s) => s.aggregate.inquiry.review.statistics?.average ?? 0,
    //   ),
    // ),

    validator("sale.view_count")(
      GaffComparator.numbers((s) => s.aggregate.view.view_count),
    ),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
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
