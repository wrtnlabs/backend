import { TestValidator } from "@nestia/e2e";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import imp from "iamport-server-api";
import toss from "toss-payments-server-api";
import { randint, sleep_for } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubDeposit } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDeposit";
import { IHubDepositCharge } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositCharge";
import { IHubDepositChargePublish } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositChargePublish";
import { IHubDepositHistory } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositHistory";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { generate_random_deposit_charge_publish } from "./internal/generate_random_deposit_charge_publish";

export const test_hub_deposit_charge_publish_vbank = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test(pool, "iamport");
  await test(pool, "toss.payments");
};

const test = async (
  pool: ConnectionPool,
  vendor: "iamport" | "toss.payments",
): Promise<void> => {
  // 고객 회원 가입
  await test_api_hub_customer_join(pool);

  // 예치금 입금 신청
  const value: number = randint(100, 3_000) * 10_000;
  const charge: IHubDepositCharge =
    await HubApi.functional.hub.customers.deposits.charges.create(
      pool.customer,
      {
        value,
      },
    );
  TestValidator.equals("value")(value)(charge.value);
  TestValidator.equals("publish")(charge.publish)(null);

  // 예치금 가상 계좌 결제 발급
  const publish: IHubDepositChargePublish =
    await generate_random_deposit_charge_publish(pool, charge, {
      vendor,
      paid: false,
    });
  const reloaded: IHubDepositCharge =
    await HubApi.functional.hub.customers.deposits.charges.at(
      pool.customer,
      charge.id,
    );
  TestValidator.equals("publish")(reloaded.publish)(publish);

  await validate(pool, charge, false);

  // 가상 계좌 입금 완료
  await income(pool, charge);
  await validate(pool, charge, true);
};

const income = async (
  pool: ConnectionPool,
  charge: IHubDepositCharge,
): Promise<void> => {
  const payment: IPaymentHistory =
    await HubApi.functional.hub.customers.deposits.charges.payment(
      pool.customer,
      charge.id,
    );

  if (payment.vendor.code === "iamport")
    await imp.functional.internal.deposit(
      await TestGlobal.fakeIamportConnector("test-iamport-create"),
      payment.vendor.uid,
    );
  else if (payment.vendor.code === "toss.payments")
    await toss.functional.internal.deposit(
      TestGlobal.fakeTossConnector("test-toss.payments-create"),
      payment.vendor.uid,
    );
  await sleep_for(2_000);
};

const validate = async (
  pool: ConnectionPool,
  charge: IHubDepositCharge,
  paid: boolean,
): Promise<void> => {
  // 잔고 검증
  const balance: number =
    await HubApi.functional.hub.customers.deposits.histories.balance(
      pool.customer,
    );
  TestValidator.equals("balance")(balance)(paid ? charge.value : 0);

  // 예치금 입출금 내역 전체 검증
  const page: IPage<IHubDepositHistory> =
    await HubApi.functional.hub.customers.deposits.histories.index(
      pool.customer,
      {},
    );
  TestValidator.equals("histories.length")(page.data.length)(paid ? 1 : 0);

  if (paid === false) return;

  // 개별 내역 상세 검증
  const history: IHubDepositHistory = page.data[0];
  TestValidator.equals("history.source_id")(history.source_id)(charge.id);
  TestValidator.equals("histories[].citizen")(charge.customer.citizen)(
    history.citizen,
  );
  TestValidator.equals("histories[].value")(history.value)(charge.value);
  TestValidator.equals("histories[].balance")(history.balance)(charge.value);

  // 메타데이터 검증
  const metadata: IHubDeposit = history.deposit;
  TestValidator.equals("metadata.source")(metadata.source)(
    "hub_deposit_charges",
  );
  TestValidator.equals("meta.direction")(metadata.direction)(1);
};
