import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_order } from "./internal/generate_random_order";
import { generate_random_order_publish } from "./internal/generate_random_order_publish";

export const test_api_hub_order_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  //----
  // PREPARE ASSETS
  //----
  // 고객, 관리자 및 예치금 공여
  const customer: IHubCustomer = await test_api_hub_customer_join(pool);
  await test_api_hub_admin_login(pool);
  await HubApi.functional.hub.admins.deposits.donations.create(pool.admin, {
    citizen_id: customer.citizen!.id,
    value: 10_000_000,
    reason: RandomGenerator.content()()(),
  });

  // 25 명의 판매자, 25 개의 매물, 그리고 25 개의 장바구니와 주문
  //
  // Publish 설정 확률 75%
  const orders: IHubOrder[] = await ArrayUtil.asyncRepeat(COUNT)(async () => {
    await test_api_hub_seller_join(pool);
    const sale: IHubSale = await generate_random_sale(pool, "approved");
    const commodity: IHubCartCommodity = await generate_random_cart_commodity(
      pool,
      sale,
    );

    const order: IHubOrder = await generate_random_order(pool, [commodity]);
    if (Math.random() < 0.75)
      order.publish = await generate_random_order_publish(pool, order);
    return order;
  });

  await ArrayUtil.asyncRepeat(COUNT)(async () => {
    await test_api_hub_seller_join(pool, {
      email: HubGlobal.env.STORE_EMAIL,
      password: "dkanrjsk",
      nickname: "wrtn",
    });
    const sale: IHubSale = await generate_random_sale(pool, "approved");
    const commodity: IHubCartCommodity = await generate_random_cart_commodity(
      pool,
      sale,
    );

    const order: IHubOrder = await generate_random_order(pool, [commodity]);
    if (Math.random() < 0.75)
      order.publish = await generate_random_order_publish(pool, order);
    return order;
  });

  //----
  // TEST SEARCH
  //----
  // 검증기 준비
  const validator = TestValidator.search("search orders")(
    async (input: IHubOrder.IRequest.ISearch) => {
      const page: IPage<IHubOrder> =
        await HubApi.functional.hub.customers.orders.index(pool.customer, {
          search: input,
          sort: ["-order.created_at"],
          limit: COUNT,
        });
      return page.data;
    },
  )(orders, 2);

  // 기간
  await validator({
    fields: ["from", "to"],
    values: (order) => [order.created_at ?? new Date(0).toISOString()],
    filter: (order, [from, to]) =>
      new Date(order.created_at) >= new Date(from) &&
      new Date(order.created_at) <= new Date(to),
    request: ([from, to]) => ({
      from,
      to,
    }),
  });

  // 제목
  await validator({
    fields: ["sale.title"],
    values: (order) => [order.goods[0].commodity.sale.content.title],
    filter: (order, [title]) =>
      order.goods.some((oi) => oi.commodity.sale.content.title.includes(title)),
    request: ([title]) => ({
      sale: {
        title,
      },
    }),
  });

  await validator({
    fields: ["seller.show_wrtn = false"],
    values: (order) => [
      order.goods[0].commodity.sale.seller.member.emails[0].value,
    ],
    request: () => ({ sale: { seller: { show_wrtn: false } } }),
    filter: (order) =>
      !order.goods[0].commodity.sale.seller.member.emails[0].value.includes(
        HubGlobal.env.STORE_EMAIL,
      ),
  });

  await validator({
    fields: ["seller.show_wrtn = true"],
    values: (order) => [
      order.goods[0].commodity.sale.seller.member.emails[0].value,
    ],
    request: () => ({ sale: { seller: { show_wrtn: true } } }),
    filter: (order) =>
      order.goods[0].commodity.sale.seller.member.emails[0].value.includes(
        HubGlobal.env.STORE_EMAIL,
      ),
  });

  // // 상태
  // await validator<["published" | "expired" | "cancelled"]>({
  //     fields: ["state"],
  //     values: (order) => [
  //         order.cancelled_at
  //             ? true
  //             : order.expired_at !== null &&
  //               new Date(order.expired_at).getTime() < Date.now()
  //             ? true
  //             : order.published_at !== null &&
  //               new Date(order.published_at).getTime() > Date.now()
  //             ? true
  //             : false,
  //     ],
  //     filter: (order, [state]) =>
  //         state === "cancelled"
  //             ? order.cancelled_at !== null
  //             : state === "expired"
  //             ? order.expired_at !== null && new Date(order.expired_at).getTime() < Date.now()
  //             : state === "published"
  //             ? order.published_at !== null && new Date(order.published_at).getTime() > Date.now()
  //             : order.published_at === null,
  //     request: ([state]) => ({ [state]: true }),
  // });
};

const COUNT = 25;
