import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_order } from "./internal/generate_random_order";
import { generate_random_order_publish } from "./internal/generate_random_order_publish";

export const test_api_hub_order_publish_at_seller = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 고객의 회원 가입
  const customer: IHubCustomer = await test_api_hub_customer_join(pool);

  // 관리자가 로그인하여 고객에게 예치금 공여
  await test_api_hub_admin_login(pool);
  await HubApi.functional.hub.admins.deposits.donations.create(pool.admin, {
    citizen_id: customer.citizen!.id,
    value: 10_000_000,
    reason: RandomGenerator.content()()(),
  });

  // 4명의 판매자가 각각 매물을 생성
  const assets: ISellerAsset[] = await ArrayUtil.asyncRepeat(4)(async () => {
    const seller: IHubSeller.IInvert = await test_api_hub_seller_join(pool);
    const sale: IHubSale = await generate_random_sale(pool, "approved");
    return { seller, sale };
  });

  // 고객이 위 4개 매물을 모두 구매
  const commodities: IHubCartCommodity[] = await ArrayUtil.asyncMap(
    assets.map((a) => a.sale),
  )((sale) => generate_random_cart_commodity(pool, sale));
  const order: IHubOrder = await generate_random_order(pool, commodities);
  order.publish = await generate_random_order_publish(pool, order);

  // 각각의 판매자가 각각의 매물을 조회한다
  for (const { seller } of assets) {
    await test_api_hub_customer_create(pool, pool.seller);
    await HubApi.functional.hub.sellers.authenticate.login(pool.seller, {
      email: seller.member.emails[0].value,
      password: TestGlobal.PASSWORD,
    });

    // 단 하나의 주문 상품만 존재
    const read: IHubOrder = await HubApi.functional.hub.sellers.orders.at(
      pool.seller,
      order.id,
    );
    TestValidator.equals("order.goods.length")(read.goods.length)(1);

    // 판매자 정보 일치 여부 확인
    TestValidator.equals("order.goods[0].~seller")(
      typia.misc.clone<Omit<IHubSeller.IInvert, "customer">>(
        read.goods[0].commodity.sale.seller,
      ),
    )(seller);
  }
};

interface ISellerAsset {
  seller: IHubSeller.IInvert;
  sale: IHubSale;
}
