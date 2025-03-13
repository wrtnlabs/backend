import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleInquiryComment } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiryComment";
import { IHubSaleReview } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleReview";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../../carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "../../orders/internal/generate_random_order";
import { generate_random_order_publish } from "../../orders/internal/generate_random_order_publish";
import { generate_random_sale } from "../internal/generate_random_sale";
import { generate_random_sale_inquiry_comment } from "../internal/generate_random_sale_inquiry_comment";
import { generate_random_sale_review } from "../internal/generate_random_sale_review";

export const test_api_hub_sale_review_comment_update = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order);

  const review: IHubSaleReview = await generate_random_sale_review(
    pool,
    order.goods[0],
  );

  const validate = async (actor: "customers" | "sellers") => {
    const comment: IHubSaleInquiryComment =
      await generate_random_sale_inquiry_comment(pool, actor, sale, review);
    comment.snapshots.push(
      ...(await ArrayUtil.asyncRepeat(3)(async () => {
        const snapshot: IHubSaleInquiryComment.ISnapshot =
          await HubApi.functional.hub[actor].sales.reviews.comments.update(
            actor === "customers" ? pool.customer : pool.seller,
            sale.id,
            review.id,
            comment.id,
            {
              format: "txt",
              body: RandomGenerator.content()()(),
              files: [],
            },
          );
        return snapshot;
      })),
    );

    const read: IHubSaleInquiryComment =
      await HubApi.functional.hub.customers.sales.reviews.comments.at(
        pool.customer,
        sale.id,
        review.id,
        comment.id,
      );
    TestValidator.equals(actor)(comment)(read);
  };
  await validate("customers");
  await validate("sellers");
};
