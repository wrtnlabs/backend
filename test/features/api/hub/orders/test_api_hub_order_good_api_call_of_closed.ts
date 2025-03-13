import { TestValidator } from "@nestia/e2e";
import { OpenApi } from "@samchon/openapi";
import TossApi from "toss-payments-server-api";
import { ITossCardPayment } from "toss-payments-server-api/lib/structures/ITossCardPayment";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { sleep_for } from "tstl";
import typia from "typia";
import { v4 } from "uuid";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale_of_toss_payments } from "../sales/internal/generate_random_sale_of_toss_payments";
import { generate_random_order } from "./internal/generate_random_order";
import { generate_random_order_publish } from "./internal/generate_random_order_publish";

export const test_api_hub_order_good_api_call_of_closed = async (
  pool: ConnectionPool,
): Promise<void> => {
  //----
  // 중개 상품 구매하기
  //----
  // 액터 준비
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);
  const customer: IHubCustomer.IAuthorized =
    await test_api_hub_customer_join(pool);

  // 매물에서 주문까지 일괄 생성
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    await generate_random_sale_of_toss_payments(pool, "approved"),
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order, {
    opened_at: new Date(Date.now() - 1_000).toISOString(),
    closed_at: new Date(Date.now() + 1_000).toISOString(),
  });

  // 스웨거 정보 열람하기
  const good: IHubOrderGood = order.goods[0];
  const sale: IHubSaleSnapshot.IInvert = good.commodity.sale;
  const unit: IHubSaleUnit.IInvert = sale.units[0];
  const swagger: OpenApi.IDocument =
    await HubApi.functional.hub.customers.orders.goods.snapshots.swagger(
      pool.customer,
      order.id,
      good.id,
      sale.snapshot_id,
      {
        unit_id: unit.id,
      },
    );

  //----
  // 카드 결제 API 를 중개 상품을 통하여 호출.
  //----
  await sleep_for(1_000);

  // 실제 서버는 실패
  await TestValidator.httpError("unopened")(410)(() =>
    test_fake_card_payment({
      host: swagger.servers![0].url,
      headers: {
        Authorization: customer.setHeaders.Authorization,
      },
    }),
  );

  // 테스트 서버는 호출 가능
  await test_fake_card_payment({
    host: swagger.servers![1].url,
    headers: {
      Authorization: customer.setHeaders.Authorization,
    },
  });
};

const test_fake_card_payment = async (
  connection: TossApi.IConnection,
): Promise<ITossCardPayment> => {
  //----
  // 결제하기
  //----
  // 결제 요청 레코드 발행하기
  //
  // 백엔드 서버에서 토스 페이먼츠 서버의 API 를 직접 호출하여, 즉시 승인되는 카드 결제를
  // 진행하는 게 아닌, 프론트 앱이 토스 페이먼츠가 제공해주는 결제 창을 이용한다는 가정.
  //
  // 토스 페이먼츠는 이처럼 프론트 앱에서 백엔드 서버를 거치지 않고, 토스 페이먼츠 고유의
  // 결제 창을 이용하여 직접 결제를 진행하는 경우, 백엔드 서버에서 이를 별도 승인
  // 처리해주기 전까지 정식 결제로 인정치 아니함.
  //
  // 때문에 {@link ITossCardPayment.ICreate.__approved} 값을 `false` 로 하여,
  // 백엔드에서 해당 결제 요청 건에 대하여 별도의 승인 처리가 필요한 상황을 고의로 만듦.
  const payment: ITossCardPayment = await TossApi.functional.v1.payments.key_in(
    connection,
    {
      // 카드 정보
      method: "card",
      cardNumber: "1111222233334444",
      cardExpirationYear: "24",
      cardExpirationMonth: "03",

      // 주문 정보
      orderId: v4(),
      amount: 30_000,

      // FAKE PROPERTY
      __approved: false,
    },
  );
  typia.assert(payment);

  // 잘못된 `orderId` 로 승인 처리시, 불발됨
  await TestValidator.httpError("approve() with wrong orderId")(422)(() =>
    TossApi.functional.v1.payments.approve(connection, payment.paymentKey, {
      orderId: "wrong-order-id",
      amount: payment.totalAmount,
    }),
  );

  // 잘못된 결제 금액으로 승인 처리시, 마찬가지로 불발됨
  await TestValidator.httpError("approve() with wrong amount")(422)(() =>
    TossApi.functional.v1.payments.approve(connection, payment.paymentKey, {
      orderId: payment.orderId,
      amount: payment.totalAmount - 100,
    }),
  );

  // 정확한 `orderId` 와 주문 금액을 입력해야 비로소 승인 처리된다.
  const approved: ITossPayment = await TossApi.functional.v1.payments.approve(
    connection,
    payment.paymentKey,
    {
      orderId: payment.orderId,
      amount: payment.totalAmount,
    },
  );
  const card: ITossCardPayment = typia.assert<ITossCardPayment>(approved);
  TestValidator.equals("approvedAt")(!!card.approvedAt)(true);
  TestValidator.equals("status")(card.status)("DONE");

  return card;
};
