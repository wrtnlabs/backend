import { TestValidator } from "@nestia/e2e";
import {
  ChatGptTypeChecker,
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
} from "@samchon/openapi";
import typia from "typia";
import { v4 } from "uuid";

import { StudioMetaChatSecretService } from "../../../src/providers/studio/meta/StudioMetaChatSecretService";

export const test_provider_studio_meta_chat_secret_service_prepare =
  async (): Promise<void> => {
    const document: OpenApi.IDocument = await fetch(
      "https://wrtnlabs.github.io/connectors/swagger/swagger.json",
    ).then((r) => r.json());
    const application: IHttpLlmApplication<"chatgpt"> = HttpLlm.application({
      model: "chatgpt",
      document,
      options: {
        separate: (schema) =>
          ChatGptTypeChecker.isString(schema) &&
          schema["x-wrtn-secret-key"] !== undefined,
      },
    });
    const func: IHttpLlmFunction<"chatgpt"> | undefined =
      application.functions.find(
        (f) => f.path === "/connector/gmail/send" && f.method === "post",
      );
    typia.assertGuard<IHttpLlmFunction<"chatgpt">>(func);

    const service: StudioMetaChatSecretService =
      new StudioMetaChatSecretService({
        id: v4(),
      });
    service.prepare(func);

    const secret = service["secrets"].get("google");
    TestValidator.equals("secret")({
      ...secret,
      scopes: Array.from(secret?.scopes ?? []),
    })({
      key: "google",
      scopes: ["https://mail.google.com/"],
    });
  };
