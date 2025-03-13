import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleReview } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleReview";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../../carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "../../orders/internal/generate_random_order";
import { generate_random_order_publish } from "../../orders/internal/generate_random_order_publish";
import { generate_random_sale } from "../internal/generate_random_sale";
import { generate_random_sale_inquiry_answer } from "../internal/generate_random_sale_inquiry_answer";
import { generate_random_sale_review } from "../internal/generate_random_sale_review";

export const test_api_hub_sale_review_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  await ArrayUtil.asyncRepeat(REPEAT)(async () => {
    await test_api_hub_customer_join(pool);
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
    if (Math.random() < 0.5)
      await generate_random_sale_inquiry_answer(pool, sale, review);
  });

  const validator = TestValidator.sort("reviews.index")<
    IHubSaleReview.ISummary,
    IHubSaleReview.IRequest.SortableColumns,
    IPage.Sort<IHubSaleReview.IRequest.SortableColumns>
  >(async (input: IPage.Sort<IHubSaleReview.IRequest.SortableColumns>) => {
    const page: IPage<IHubSaleReview.ISummary> =
      await HubApi.functional.hub.customers.sales.reviews.index(
        pool.customer,
        sale.id,
        {
          limit: REPEAT,
          sort: input,
        },
      );
    return page.data;
  });

  const components = [
    validator("created_at")(GaffComparator.dates((x) => x.created_at)),
    validator("updated_at")(GaffComparator.dates((x) => x.updated_at)),
    validator("answered_at")(
      GaffComparator.dates(
        (x) => x.answer?.created_at ?? new Date("9999-12-31").toISOString(),
      ),
    ),
    validator("title")(GaffComparator.strings((x) => x.title)),
    validator("nickname")(
      GaffComparator.strings((x) => x.customer.member!.nickname),
    ),
    validator("score")(GaffComparator.numbers((x) => x.score)),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};

const REPEAT = 25;
