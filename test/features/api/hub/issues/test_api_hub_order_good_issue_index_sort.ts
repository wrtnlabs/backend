import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";

import api from "@wrtnlabs/os-api";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubOrderGoodIssue } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssue";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "../orders/internal/generate_random_order";
import { generate_random_order_publish } from "../orders/internal/generate_random_order_publish";
import { generate_random_sale } from "../sales/internal/generate_random_sale";

export const test_api_hub_order_good_issue_index_sort = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  // 매물에서 이슈 까지 일괄 생성
  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order);

  const good: IHubOrderGood = order.goods[0];

  await ArrayUtil.asyncRepeat(REPEAT)(async () => {
    const actor = Math.random() < 0.5 ? "customers" : "sellers";
    await api.functional.hub[actor].orders.goods.issues.create(
      actor === "customers" ? pool.customer : pool.seller,
      order.id,
      good.id,
      {
        format: "txt",
        title: "test",
        body: "test",
        files: [],
      },
    );
  });

  const validator = TestValidator.sort("issue.index")<
    IHubOrderGoodIssue.ISummary,
    IHubOrderGoodIssue.IRequest.SortableColumns,
    IPage.Sort<IHubOrderGoodIssue.IRequest.SortableColumns>
  >(async (input: IPage.Sort<IHubOrderGoodIssue.IRequest.SortableColumns>) => {
    const page: IPage<IHubOrderGoodIssue.ISummary> =
      await api.functional.hub.customers.orders.goods.issues.index(
        pool.customer,
        order.id,
        good.id,
        {
          limit: REPEAT,
          sort: input,
        },
      );
    return page.data;
  });

  const components = [
    validator("created_at")(GaffComparator.dates((x) => x.created_at)),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};
const REPEAT = 25;
