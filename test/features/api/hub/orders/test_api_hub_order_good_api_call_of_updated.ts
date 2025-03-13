import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { OpenApi } from "@samchon/openapi";
import TossApi from "toss-payments-server-api";
import { ITossCardPayment } from "toss-payments-server-api/lib/structures/ITossCardPayment";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { ITossVirtualAccountPayment } from "toss-payments-server-api/lib/structures/ITossVirtualAccountPayment";
import typia from "typia";
import { v4 } from "uuid";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubSaleUnitParameter } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitParameter";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale_audit } from "../sales/internal/generate_random_sale_audit";
import { generate_random_sale_of_toss_payments } from "../sales/internal/generate_random_sale_of_toss_payments";
import { generate_random_order } from "./internal/generate_random_order";
import { generate_random_order_publish } from "./internal/generate_random_order_publish";

export const test_api_hub_order_good_api_call_of_updated = async (
  pool: ConnectionPool,
): Promise<void> => {
  //----
  // 중개 상품 구매하기
  //----
  // 액터 준비
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);
  await test_api_hub_customer_join(pool);

  // 매물에서 주문까지 일괄 생성
  const sale: IHubSale = await generate_random_sale_of_toss_payments(
    pool,
    "approved",
  );
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order);

  //----
  // 돌연 매물이 면집됨
  //----
  await ArrayUtil.asyncRepeat(5)(() => update(pool)(sale));

  // 주문 상품으로부터 이용 가능한 스냅샷 리스트 불러오기
  const snapshots: IPage<IHubSaleSnapshot.IInvert> =
    await HubApi.functional.hub.customers.orders.goods.snapshots.index(
      pool.customer,
      order.id,
      order.goods[0].id,
      {},
    );

  // 스웨거 정보 열람하기
  for (const next of snapshots.data) {
    const swagger: OpenApi.IDocument =
      await HubApi.functional.hub.customers.orders.goods.snapshots.swagger(
        pool.customer,
        order.id,
        order.goods[0].id,
        next.snapshot_id,
        {
          unit_id: next.units[0].id,
        },
      );

    //----
    // 토스 페이먼츠 테스트 코드 재현
    //----
    const connection: TossApi.IConnection = {
      host: swagger.servers![1].url,
      headers: pool.customer.headers,
    };

    // 카드 결제 테스트
    //
    // - GET 과 POST 메서드의 정상 동작 여부 확인
    // - 판매자 서버에서 에러 발생시 프록시 정상 동작 여부 확인
    //
    // https://github.com/samchon/payments/blob/master/packages/fake-toss-payments-server/test/features/test_fake_card_payment.ts
    const payment: ITossCardPayment = await test_fake_card_payment(connection);

    // 이외에 판매자 서버에서 404 에러가 발생해도 정확히 캐치
    await TestValidator.httpError("approve() with wrong amount")(404)(() =>
      TossApi.functional.v1.payments.at(
        connection,
        payment.paymentKey + "ABCD",
      ),
    );

    // 가상 계좌 결제
    //
    // - GET 과 POST 메서드의 정상 동작 여부 확인
    // - PUT 메서드이되 body 가 없는 경우 검증
    //
    // https://github.com/samchon/payments/blob/master/packages/fake-toss-payments-server/test/features/test_fake_virtual_account_payment.ts
    await test_fake_virtual_account_payment(connection);
  }
};

const update = (pool: ConnectionPool) => async (sale: IHubSale) => {
  const parameters: IPage<IHubSaleUnitParameter> =
    await HubApi.functional.hub.sellers.sales.snapshots.units.parameters.index(
      pool.seller,
      sale.id,
      sale.snapshot_id,
      sale.units[0].id,
      {
        limit: 9999,
      },
    );

  const replica = await HubApi.functional.hub.sellers.sales.replica(
    pool.seller,
    sale.id,
  );

  const updated: IHubSale = await HubApi.functional.hub.sellers.sales.update(
    pool.seller,
    sale.id,
    {
      ...replica,
      version: `0.1.${++patch.value}`,
    },
  );

  const audit: IHubSaleAudit = await generate_random_sale_audit(pool, updated);
  await HubApi.functional.hub.admins.sales.audits.approve(
    pool.admin,
    updated.id,
    audit.id,
    {
      fee_ratio: 0.1,
      snapshot_id: null,
    },
  );

  for (const param of parameters.data) {
    await HubApi.functional.hub.sellers.sales.snapshots.units.parameters.create(
      pool.seller,
      updated.id,
      updated.snapshot_id,
      updated.units[0].id,
      param,
    );
  }
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

const test_fake_virtual_account_payment = async (
  connection: TossApi.IConnection,
): Promise<ITossVirtualAccountPayment> => {
  //----
  // 결제하기
  //----
  // 결제 요청 레코드 발행하기
  //
  // 백엔드 서버에서 토스 페이먼츠 서버의 API 를 직접 호출하여, 즉시 승인되는 가상 계좌
  // 결제를 진행하는 게 아닌, 프론트 앱이 토스 페이먼츠가 제공해주는 결제 창을 이용한다는
  // 가정.
  //
  // 토스 페이먼츠는 이처럼 프론트 앱에서 백엔드 서버를 거치지 않고, 토스 페이먼츠 고유의
  // 결제 창을 이용하여 직접 결제를 진행하는 경우, 백엔드 서버에서 이를 별도 승인
  // 처리해주기 전까지 정식 결제로 인정치 아니함.
  //
  // 때문에 {@link ITossVirtualAccountPayment.ICreate.__approved} 값을 `false` 로 하여,
  // 백엔드에서 해당 결제 요청 건에 대하여 별도의 승인 처리가 필요한 상황을 고의로 만듦.
  const payment: ITossVirtualAccountPayment =
    await TossApi.functional.v1.virtual_accounts.create(connection, {
      // 가싱 계좌 정보
      method: "virtual-account",
      bank: "신한",
      customerName: RandomGenerator.name(3),

      // 주문 정보
      orderId: v4(),
      orderName: RandomGenerator.name(8),
      amount: 25_000,

      // 고의 미승인 처리
      __approved: false,
    });
  typia.assert(payment);

  // 결제 요청 승인하기
  //
  // 백엔드 서버에서 해당 건을 승인함으로써, 비로소 해당 결제가 완성된다.
  const approved: ITossPayment = await TossApi.functional.v1.payments.approve(
    connection,
    payment.paymentKey,
    {
      orderId: payment.orderId,
      amount: payment.totalAmount,
    },
  );
  typia.assert<ITossVirtualAccountPayment>(approved);

  //----
  // 입금하기
  //----
  // 고객이 자신 앞으로 발급된 가상 계좌에
  // 결제 금액을 입금하는 상황 시뮬레이션
  await TossApi.functional.internal.deposit(connection, payment.paymentKey);

  // 결제 레코드를 다시 불러보면
  const reloaded: ITossPayment = await TossApi.functional.v1.payments.at(
    connection,
    payment.paymentKey,
  );
  typia.assert<ITossVirtualAccountPayment>(reloaded);

  // 결제 완료 처리되었음을 알 수 있다
  TestValidator.equals("status")(reloaded.status)("DONE");

  // if condition 에 의하여 자동 다운 캐스팅 됨.
  payment.virtualAccount.accountNumber;
  return payment;
};

const patch = { value: 0 };
