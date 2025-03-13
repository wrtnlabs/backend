import toss from "toss-payments-server-api";
import { ITossCardPayment } from "toss-payments-server-api/lib/structures/ITossCardPayment";
import { randint } from "tstl";

import { TestGlobal } from "../../../TestGlobal";

export const generate_random_toss_card_payment = async (input: {
  storeId: string;
  orderId: string;
  amount: number;
}): Promise<ITossCardPayment> => {
  const payment: ITossCardPayment = await toss.functional.v1.payments.key_in(
    TestGlobal.fakeTossConnector(input.storeId),
    {
      method: "card",
      cardNumber: new Array(4)
        .fill("")
        .map(() => randint(0, 9999).toString().padStart(4, "0"))
        .join(""),
      cardExpirationYear: `${randint(2024, 2028)}`,
      cardExpirationMonth: randint(1, 12).toString().padStart(2, "0"),
      amount: input.amount,
      orderId: input.orderId,
    },
  );
  return payment;
};
