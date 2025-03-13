import { ArrayUtil, TestValidator } from "@nestia/e2e";

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

export const test_api_hub_sale_review_index_search = async (
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

  const expected: IPage<IHubSaleReview.ISummary> =
    await HubApi.functional.hub.customers.sales.reviews.index(
      pool.customer,
      sale.id,
      {
        limit: REPEAT,
      },
    );

  const validator = TestValidator.search("search")(
    async (search: IHubSaleReview.IRequest.ISearch) => {
      const page: IPage<IHubSaleReview.ISummary> =
        await HubApi.functional.hub.customers.sales.reviews.index(
          pool.customer,
          sale.id,
          {
            search,
            limit: REPEAT,
          },
        );
      return page.data;
    },
  )(expected.data, 2);

  // ATOMIC VALUES
  await validator({
    fields: ["name"],
    values: (arc) => [arc.customer.citizen!.name],
    request: ([name]) => ({ name }),
    filter: (arc, [name]) => arc.customer.citizen!.name === name,
  });
  await validator({
    fields: ["nickname"],
    values: (arc) => [
      arc.customer.member?.nickname ??
        arc.customer.external_user?.nickname ??
        "",
    ],
    request: ([nickname]) => ({ nickname }),
    filter: (arc, [nickname]) =>
      (
        arc.customer.member?.nickname ?? arc.customer.external_user?.nickname
      )?.includes(nickname) ?? false,
  });
  await validator({
    fields: ["title"],
    values: (arc) => [arc.title],
    request: ([title]) => ({ title }),
    filter: (arc, [title]) => arc.title.includes(title),
  });
  await validator({
    fields: ["score"],
    values: (arc) => [arc.score],
    request: ([score]) => ({ minimum: score * 0.9, maximum: score * 1.1 }),
    filter: (arc, [minimum, maximum]) =>
      minimum <= arc.score && arc.score <= maximum,
  });

  // VALIDATE ANSWERED STATE
  for (const flag of [true, false])
    await validator({
      fields: ["answered"],
      values: () => [flag],
      request: ([answered]) => ({ answered }),
      filter: (arc, [answered]) => !!arc.answer === answered,
    });
  await validator({
    fields: ["answered"],
    values: () => [null],
    request: ([answered]) => ({ answered }),
    filter: () => true,
  });
};

const REPEAT = 25;
