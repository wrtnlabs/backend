import { TestValidator } from "@nestia/e2e";
import { HttpMigration, OpenApi } from "@samchon/openapi";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";

export const test_api_hub_openapi_translate_document = async (
  pool: ConnectionPool,
): Promise<boolean> => {
  if (HubGlobal.env.GOOGLE_APPLICATION_CREDENTIALS === undefined) return false;

  // GET SWAGGER
  await test_api_hub_customer_join(pool);
  const url: string =
    "https://wrtnlabs.github.io/connectors/swagger/swagger.json";
  const original: OpenApi.IDocument = await fetch(url).then((r) => r.json());

  // CLEAR
  await HubGlobal.prisma.hub_external_swagger_documents.deleteMany({
    where: {
      src_url: url,
    },
  });

  // TRANSLATE
  const korean: OpenApi.IDocument =
    await HubApi.functional.hub.customers.openapi.translate.document(
      pool.customer,
      {
        type: "url",
        language: "ko",
        url,
      },
    );
  const japanese: OpenApi.IDocument =
    await HubApi.functional.hub.customers.openapi.translate.document(
      pool.customer,
      {
        type: "url",
        language: "ja",
        url,
      },
    );
  TestValidator.error("korean vs english")(() =>
    TestValidator.equals("translated")(korean)(original),
  );
  TestValidator.error("korean vs japanese")(() =>
    TestValidator.equals("translated")(korean)(japanese),
  );

  // RE-TRANSLATE
  const koAgain: OpenApi.IDocument =
    await HubApi.functional.hub.customers.openapi.translate.document(
      pool.customer,
      {
        type: "url",
        language: "ko",
        url,
      },
    );
  TestValidator.equals("re-translation")(korean)(koAgain);

  // THE SAME LANGUAGE
  const enAgain: OpenApi.IDocument =
    await HubApi.functional.hub.customers.openapi.translate.document(
      pool.customer,
      {
        type: "url",
        language: "en",
        url,
      },
    );
  HttpMigration.application(enAgain);
  TestValidator.equals("original")(original)(enAgain);

  return true;
};
