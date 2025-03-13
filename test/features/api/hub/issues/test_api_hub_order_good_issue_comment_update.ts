import { ArrayUtil, TestValidator } from "@nestia/e2e";

import api from "@wrtnlabs/os-api";
import HubApi from "@wrtnlabs/os-api";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubOrderGoodIssue } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssue";
import { IHubOrderGoodIssueComment } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueComment";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { prepare_random_bbs_article_comment_store } from "../../common/prepare_random_bbs_article_comment_store";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "../orders/internal/generate_random_order";
import { generate_random_order_publish } from "../orders/internal/generate_random_order_publish";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_order_good_issue_comment } from "./internal/generate_random_order_good_issue_comment";

export const test_api_hub_order_good_issue_comment_update = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);
  await test_api_hub_customer_join(pool);

  // 매물에서 이슈 댓글 까지 일괄 생성
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

  const validate = async (actor: "customers" | "sellers") => {
    const comment: IHubOrderGoodIssueComment =
      await generate_random_order_good_issue_comment(
        pool,
        actor,
        order,
        good,
        issue,
      );
    comment.snapshots.push(
      ...(await ArrayUtil.asyncRepeat(3)(async () => {
        const snapshot: IHubOrderGoodIssueComment.ISnapshot =
          await HubApi.functional.hub[
            actor
          ].orders.goods.issues.comments.update(
            actor === "customers" ? pool.customer : pool.seller,
            order.id,
            good.id,
            issue.id,
            comment.id,
            prepare_random_bbs_article_comment_store(),
          );
        return snapshot;
      })),
    );

    const read: IHubOrderGoodIssueComment =
      await HubApi.functional.hub.customers.orders.goods.issues.comments.at(
        pool.customer,
        order.id,
        good.id,
        issue.id,
        comment.id,
      );
    TestValidator.equals(actor)(comment)(read);
  };
  await validate("customers");
  await validate("sellers");
};
