import {
  ArrayUtil,
  GaffComparator,
  RandomGenerator,
  TestValidator,
} from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_order } from "./internal/generate_random_order";
import { generate_random_order_publish } from "./internal/generate_random_order_publish";

export const test_api_hub_order_index_sort = async (
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
  // Expiration date 설정 확률 56.25%
  await ArrayUtil.asyncRepeat(COUNT)(async () => {
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

  //----
  // TEST SORT
  //----
  // 검증기 준비
  const validator = TestValidator.sort("orders.index")<
    IHubOrder,
    IHubOrder.IRequest.SortableColumns,
    IPage.Sort<IHubOrder.IRequest.SortableColumns>
  >(async (input: IPage.Sort<IHubOrder.IRequest.SortableColumns>) => {
    const page: IPage<IHubOrder> =
      await HubApi.functional.hub.customers.orders.index(pool.customer, {
        sort: input,
      });
    return page.data;
  });

  // 검증 항목 나열
  const components = [
    validator("order.created_at")(GaffComparator.dates((o) => o.created_at)),
    validator("order.publish.created_at")(
      GaffComparator.dates(
        (o) => o.publish?.created_at ?? new Date("9999-12-31").toISOString(),
      ),
    ),
  ];

  // 검증 실시
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};

const COUNT = 25;
