import { TestValidator } from "@nestia/e2e";

import api from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubOrderGoodIssue } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssue";
import { IHubOrderGoodIssueFee } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueFee";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "../orders/internal/generate_random_order";
import { generate_random_order_publish } from "../orders/internal/generate_random_order_publish";
import { generate_random_sale } from "../sales/internal/generate_random_sale";

export const test_api_hub_order_good_issue_fee_accept = async (
  pool: ConnectionPool,
) => {
  // 액터 준비
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);
  const customer: IHubCustomer = await test_api_hub_customer_join(pool);

  // 매물에서 이슈까지 일괄 생성
  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order);

  const good: IHubOrderGood = order.goods[0];
  const issue: IHubOrderGoodIssue =
    await api.functional.hub.customers.orders.goods.issues.create(
      pool.customer,
      order.id,
      good.id,
      {
        format: "txt",
        title: "test",
        body: "test",
        files: [],
      },
    );

  // 고객이 이슈 조회
  const customerReloaded: IHubOrderGoodIssue =
    await api.functional.hub.customers.orders.goods.issues.at(
      pool.customer,
      order.id,
      good.id,
      issue.id,
    );
  TestValidator.equals("customer")(issue)(customerReloaded);

  // 판매자가 이슈 조회
  const sellerReloaded: IHubOrderGoodIssue =
    await api.functional.hub.sellers.orders.goods.issues.at(
      pool.seller,
      order.id,
      good.id,
      issue.id,
    );
  TestValidator.equals("issue")(issue)(sellerReloaded);

  // 판매자가 수임료 제시
  const fee: IHubOrderGoodIssueFee =
    await api.functional.hub.sellers.orders.goods.issues.fees.create(
      pool.seller,
      order.id,
      good.id,
      issue.id,
      {
        value: 1000,
        created_at: new Date().toISOString(),
      },
    );

  // 고객이 수임료 수락
  await api.functional.hub.customers.orders.goods.issues.fees.accept(
    pool.customer,
    order.id,
    good.id,
    issue.id,
    fee.id,
    {
      customer: customer,
      created_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    },
  );

  // @todo -> 잔고 인출 확인

  // // 고객이 수임료 수락후 취소
  //     await api.functional.hub.customers.orders.goods.issues.fees.cancel(
  //         connection,
  //         order.id,
  //         good.id,
  //         issue.id,
  //         fee.id,
  //         {
  //             customer: customer,
  //             created_at: new Date().toISOString(),
  //             published_at: new Date().toISOString(),
  //             canceled_at: new Date().toISOString(),
  //         },
  //     );
};
