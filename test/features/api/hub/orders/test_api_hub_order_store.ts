import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_order } from "./internal/generate_random_order";

export const test_api_hub_order_store = async (pool: ConnectionPool) => {
  // 액터 준비
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);
  await test_api_hub_customer_join(pool);

  // 매물에서 주문까지 일괄 생성
  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);

  // 고객은 조회 가능
  const reloaded: IHubOrder = await HubApi.functional.hub.customers.orders.at(
    pool.customer,
    order.id,
  );
  TestValidator.equals("unpublished", TestGlobal.exceptSaleKeys)(order)(
    reloaded,
  );

  // 그러나 판매자와 관리자는 조회 불가능
  for (const actor of ["admins", "sellers"] as const)
    await TestValidator.httpError("can't read unpublished")(404)(() =>
      HubApi.functional.hub[actor].orders.at(
        actor === "admins" ? pool.admin : pool.seller,
        order.id,
      ),
    );

  // @todo - API 호출도 불가능
};
