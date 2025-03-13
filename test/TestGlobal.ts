import imp from "iamport-server-api";
import { Singleton } from "tstl";

export namespace TestGlobal {
  export const EMAIL = "ecosystem@wrtn.io";
  export const SECTION = "generative";
  export const PASSWORD = "@TeamKorea";

  export const HREF = "http://localhost/TestAutomation";
  export const REFERRER = "http://localhost/NodeJS";
  export const IMAGE_URL = "https://picsum.photos/200/300?random";
  export const STATIC_PORT = 39001;

  export const fakeIamportConnector = (_storeId: string) =>
    fakeIamport.get().get();

  export const fakeTossConnector = (_storeId: string) => ({
    host: `http://127.0.0.1:30771`,
    headers: {
      // 토스 페이먼츠에서 테스트 용으로 열어준 public 시크릿 키
      Authorization: "Basic " + btoa("test_ak_ZORzdMaqN3wQd5k6ygr5AkYXQGwy:"),
    },
  });

  const fakeIamport = new Singleton(
    () =>
      new imp.IamportConnector(`http://127.0.0.1:10851`, {
        imp_key: "test_imp_key",
        imp_secret: "test_imp_secret",
      }),
  );

  export const exceptSaleKeys = (key: string): boolean =>
    key === "aggregate" || key === "swagger" || key.endsWith("_at");
}
