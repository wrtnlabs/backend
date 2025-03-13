import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
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

export const test_api_hub_order_good_at_seller = async (
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
    for (const good of order.goods)
      if (good.commodity.sale.seller.id === seller.id) {
        const invert: IHubOrderGood.IInvert =
          await HubApi.functional.hub.sellers.orders.goods.at(
            pool.seller,
            order.id,
            good.id,
          );
        TestValidator.equals("invert -> order")(invert.order)(order);
        TestValidator.equals("invert -> good", TestGlobal.exceptSaleKeys)(good)(
          invert,
        );
      } else
        await TestValidator.httpError("other")(404)(() =>
          HubApi.functional.hub.sellers.orders.goods.at(
            pool.seller,
            order.id,
            good.id,
          ),
        );
  }
};

interface ISellerAsset {
  seller: IHubSeller.IInvert;
  sale: IHubSale;
}
