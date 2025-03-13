import imp from "iamport-server-api";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import { IIamportVBankPayment } from "iamport-server-api/lib/structures/IIamportVBankPayment";

import { TestGlobal } from "../../../TestGlobal";

export async function generate_random_iamport_vbank_payment(input: {
  storeId: string;
  orderId: string;
  amount: number;
}): Promise<IIamportVBankPayment> {
  const res: IIamportResponse<IIamportVBankPayment> =
    await imp.functional.vbanks.create(
      await TestGlobal.fakeIamportConnector(input.storeId),
      {
        merchant_uid: input.orderId,
        amount: input.amount,
        vbank_code: "SHINHAN",
        vbank_due: Date.now() / 1_000 + 2 * WEEK,
        vbank_holder: "홍길동",
      },
    );
  return res.response;
}

const WEEK = 7 * 24 * 60 * 60 * 1_000;
