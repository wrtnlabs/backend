import { TestValidator } from "@nestia/e2e";
import { randint } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubDepositCharge } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositCharge";
import { IHubDepositHistory } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositHistory";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";

export const test_hub_deposit_charge_store = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 고객 준비
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

  // 잔고 조회 -> 0
  const balance: number =
    await HubApi.functional.hub.customers.deposits.histories.balance(
      pool.customer,
    );
  TestValidator.equals("balance")(balance)(0);

  // 예치금 입출금 내역 검증 -> 아무 일도 없다
  const page: IPage<IHubDepositHistory> =
    await HubApi.functional.hub.customers.deposits.histories.index(
      pool.customer,
      {},
    );
  TestValidator.equals("histories.length")(page.data.length)(0);
};
