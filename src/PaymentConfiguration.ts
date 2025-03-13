import PaymentAPI from "@samchon/payment-api";

import { HubGlobal } from "./HubGlobal";

export namespace PaymentConfiguration {
  export const HOST = () =>
    `http://127.0.0.1:${HubGlobal.env.PAYMENT_API_PORT}`;
  export const ENCRYPTION_PASSWORD = () => ({
    key: HubGlobal.env.PAYMENT_CONNECTION_ENCRYPTION_KEY,
    iv: HubGlobal.env.PAYMENT_CONNECTION_ENCRYPTION_IV,
  });

  export const connection = (): PaymentAPI.IConnection => ({
    host: HOST(),
    encryption: ENCRYPTION_PASSWORD(),
  });
}
