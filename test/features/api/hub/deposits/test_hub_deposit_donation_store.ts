import { RandomGenerator, TestValidator } from "@nestia/e2e";
import { randint } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubDeposit } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDeposit";
import { IHubDepositDonation } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositDonation";
import { IHubDepositHistory } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositHistory";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";

export const test_hub_deposit_donation_store = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 관리자와 고객 회원 준비
  await test_api_hub_admin_login(pool);
  const customer: IHubCustomer = await test_api_hub_customer_join(pool);

  // 관리자가 고객에게 예치금 공여
  const value: number = randint(300, 1_000) * 10_000;
  const donation: IHubDepositDonation =
    await HubApi.functional.hub.admins.deposits.donations.create(pool.admin, {
      citizen_id: customer.citizen!.id,
      value,
      reason: RandomGenerator.content()()(),
    });

  // 잔고 검증
  const balance: number =
    await HubApi.functional.hub.customers.deposits.histories.balance(
      pool.customer,
    );
  TestValidator.equals("balance")(balance)(value);

  // 전체 이력 검증
  const histories: IPage<IHubDepositHistory> =
    await HubApi.functional.hub.customers.deposits.histories.index(
      pool.customer,
      {},
    );
  TestValidator.equals("histories.length")(histories.data.length)(1);

  // 개별 이력 검증
  const history: IHubDepositHistory = histories.data[0];
  TestValidator.equals("history.value")(history.value)(value);
  TestValidator.equals("history.balance")(history.balance)(value);
  TestValidator.equals("history.source_id")(history.source_id)(donation.id);
  TestValidator.equals("history.citizen")(customer.citizen)(history.citizen);

  // 메타데이터 검증
  const metadata: IHubDeposit = history.deposit;
  TestValidator.equals("metadata.source")(metadata.source)(
    "hub_deposit_donations",
  );
  TestValidator.equals("metadata.direction")(metadata.direction)(1);
};
