import { TestValidator } from "@nestia/e2e";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubDepositCharge } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositCharge";
import { IHubDepositChargePublish } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositChargePublish";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { generate_random_iamport_card_payment } from "../../../common/generate_random_iamport_card_payment";
import { generate_random_iamport_vbank_payment } from "../../../common/generate_random_iamport_vbank_payment";
import { generate_random_toss_card_payment } from "../../../common/generate_random_toss_card_payment";
import { generate_random_toss_vbank_payment } from "../../../common/generate_random_toss_vbank_payment";

export const generate_random_deposit_charge_publish = async (
  pool: ConnectionPool,
  charge: IHubDepositCharge,
  input: {
    vendor: "iamport" | "toss.payments";
    paid: boolean;
  },
): Promise<IHubDepositChargePublish> => {
  const storeId: string = `test-${input.vendor}-create-id`;
  const payment: ITossPayment | IIamportPayment = await (
    input.vendor === "iamport"
      ? input.paid
        ? generate_random_iamport_card_payment
        : generate_random_iamport_vbank_payment
      : input.paid
        ? generate_random_toss_card_payment
        : generate_random_toss_vbank_payment
  )({
    storeId,
    orderId: charge.id,
    amount: charge.value,
  });
  const publish: IHubDepositChargePublish =
    await HubApi.functional.hub.customers.deposits.charges.publish(
      pool.customer,
      charge.id,
      {
        code: input.vendor,
        store_id: storeId,
        uid: typia.is<ITossPayment>(payment)
          ? payment.paymentKey
          : payment.imp_uid,
      },
    );
  typia.assert(publish);
  TestValidator.equals("paid")(input.paid)(!!publish.paid_at);
  return publish;
};
