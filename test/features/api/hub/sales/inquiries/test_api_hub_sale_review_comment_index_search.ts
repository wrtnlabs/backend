import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
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

export const test_api_hub_sale_review_comment_index_search = async (
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
  await ArrayUtil.asyncRepeat(REPEAT)(async () => {
    const actor = Math.random() < 0.5 ? "customers" : "sellers";
    if (actor === "customers") await test_api_hub_customer_join(pool);
    await generate_random_sale_inquiry_comment(pool, actor, sale, review);
  });

  const expected: IPage<IHubSaleInquiryComment> =
    await HubApi.functional.hub.customers.sales.reviews.comments.index(
      pool.customer,
      sale.id,
      review.id,
      {
        limit: REPEAT,
        search: {
          body: "test",
        },
      },
    );

  const search = TestValidator.search("comments.index")(
    async (input: IHubSaleInquiryComment.IRequest.ISearch) => {
      const page: IPage<IHubSaleInquiryComment> =
        await HubApi.functional.hub.customers.sales.reviews.comments.index(
          pool.customer,
          sale.id,
          review.id,
          {
            limit: REPEAT,
            search: input,
          },
        );
      return page.data;
    },
  )(expected.data, 4);
  await search({
    fields: ["name"],
    values: (c) => [c.writer?.citizen?.name!],
    request: ([name]) => ({ name }),
    filter: (c, [name]) => c.writer?.citizen?.name === name,
  });
  await search({
    fields: ["nickname"],
    values: (c) => [
      c.writer.type === "customer"
        ? (c.writer?.member?.nickname ?? c.writer?.external_user?.nickname!)
        : c.writer?.member.nickname!,
    ],
    request: ([nickname]) => ({ nickname }),
    filter: (c, [nickname]) =>
      (c.writer.type === "customer"
        ? (c.writer?.member?.nickname ?? c.writer?.external_user?.nickname!)
        : c.writer?.member.nickname!
      )?.includes(nickname) ?? false,
  });
  await search({
    fields: ["body"],
    values: (c) => [c.snapshots.at(-1)!.body.substring(0, 10)],
    request: ([body]) => ({ body }),
    filter: (c, [body]) => c.snapshots.at(-1)!.body.includes(body),
  });
};
const REPEAT = 25;
