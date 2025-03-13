import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";

import api from "@wrtnlabs/os-api";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubOrderGoodIssue } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssue";
import { IHubOrderGoodIssueComment } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueComment";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "../orders/internal/generate_random_order";
import { generate_random_order_publish } from "../orders/internal/generate_random_order_publish";
import { generate_random_sale } from "../sales/internal/generate_random_sale";

export const test_api_hub_order_good_issue_comment_index_sort = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  // 매물에서 이슈까지 일괄 생성
  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order);

  const good: IHubOrderGood = order.goods[0];
  const issue: IHubOrderGoodIssue =
    await api.functional.hub.customers.orders.goods.issues.create(
      pool.customer,
      order.id,
      good.id,
      {
        format: "txt",
        title: "test",
        body: "test",
        files: [],
      },
    );
  issue;

  await ArrayUtil.asyncRepeat(REPEAT)(async () => {
    const actor = Math.random() < 0.5 ? "customers" : "sellers";
    return api.functional.hub[actor].orders.goods.issues.comments.create(
      actor === "customers" ? pool.customer : pool.seller,
      order.id,
      good.id,
      issue.id,
      {
        body: "test",
        format: "txt",
        files: [],
      },
    );
  });

  const validator = TestValidator.sort("issue.comment.index")<
    IHubOrderGoodIssueComment,
    IHubOrderGoodIssueComment.IRequest.SortableColumns,
    IPage.Sort<IHubOrderGoodIssueComment.IRequest.SortableColumns>
  >(async (
    input: IPage.Sort<IHubOrderGoodIssueComment.IRequest.SortableColumns>,
  ) => {
    const page: IPage<IHubOrderGoodIssueComment> =
      await api.functional.hub.customers.orders.goods.issues.comments.index(
        pool.customer,
        order.id,
        good.id,
        issue.id,
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
