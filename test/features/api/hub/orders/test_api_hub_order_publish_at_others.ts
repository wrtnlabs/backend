import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
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

export const test_api_hub_order_publish_at_others = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 관리자와 판매자 준비
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  // 고객 회원 가입 + 예치금 공여
  const customer: IHubCustomer = await test_api_hub_customer_join(pool);
  await HubApi.functional.hub.admins.deposits.donations.create(pool.admin, {
    citizen_id: customer.citizen!.id,
    value: 10_000_000,
    reason: RandomGenerator.content()()(),
  });

  // 매물에서 주문까지 일괄 생성
  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order);

  // 타 고객의 열람 시도
  await test_api_hub_customer_join(pool);
  await TestValidator.httpError("other customer")(404)(() =>
    HubApi.functional.hub.customers.orders.at(pool.customer, order.id),
  );

  // 타 판매자의 열람 시도
  await test_api_hub_seller_join(pool);
  await TestValidator.httpError("other seller")(404)(() =>
    HubApi.functional.hub.sellers.orders.at(pool.seller, order.id),
  );
};
