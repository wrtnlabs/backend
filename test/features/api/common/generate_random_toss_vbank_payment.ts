import toss from "toss-payments-server-api";
import { ITossVirtualAccountPayment } from "toss-payments-server-api/lib/structures/ITossVirtualAccountPayment";

import { TestGlobal } from "../../../TestGlobal";

export const generate_random_toss_vbank_payment = async (input: {
  storeId: string;
  orderId: string;
  amount: number;
}): Promise<ITossVirtualAccountPayment> => {
  const payment: ITossVirtualAccountPayment =
    await toss.functional.v1.virtual_accounts.create(
      TestGlobal.fakeTossConnector(input.storeId),
      {
        method: "virtual-account",
        orderId: input.orderId,
        amount: input.amount,
        bank: "신한은행",
        customerName: "홍길동",
        orderName: "테스트 주문",
        __approved: false,
      },
    );
  return payment;
};
