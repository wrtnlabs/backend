import imp from "iamport-server-api";
import { IIamportCardPayment } from "iamport-server-api/lib/structures/IIamportCardPayment";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import { randint } from "tstl";

import { TestGlobal } from "../../../TestGlobal";

export const generate_random_iamport_card_payment = async (input: {
  storeId: string;
  orderId: string;
  amount: number;
}): Promise<IIamportCardPayment> => {
  const res: IIamportResponse<IIamportCardPayment> =
    await imp.functional.subscribe.payments.onetime(
      await TestGlobal.fakeIamportConnector(input.storeId),
      {
        card_number: new Array(4)
          .fill("")
          .map(() => randint(0, 9999).toString().padStart(4, "0"))
          .join("-"),
        expiry: `${randint(2024, 2028)}-${randint(1, 12)
          .toString()
          .padStart(2, "0")}`,
        birth: (() => {
          const from: number = Date.parse("1970-01-01");
          const to: number = Date.parse("2010-12-31");
          const date: Date = new Date(randint(from, to));

          return [
            date.getFullYear().toString().substring(2),
            (date.getMonth() + 1).toString().padStart(2, "0"),
            date.getDate().toString().padStart(2, "0"),
          ].join("");
        })(),
        merchant_uid: input.orderId,
        amount: input.amount,
        currency: "KRW",
        name: "Fake 주문",
      },
    );
  return res.response;
};
