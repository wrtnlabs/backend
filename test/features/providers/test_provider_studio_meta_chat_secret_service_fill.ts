import { TestValidator } from "@nestia/e2e";
import {
  ChatGptTypeChecker,
  HttpLlm,
  IChatGptSchema,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
} from "@samchon/openapi";
import typia from "typia";
import { v4 } from "uuid";

import { StudioMetaChatSecretService } from "../../../src/providers/studio/meta/StudioMetaChatSecretService";

export const test_provider_studio_meta_chat_secret_service_fill =
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
    typia.assertGuard<IChatGptSchema.IParameters>(func.separated?.human);

    const service: StudioMetaChatSecretService =
      new StudioMetaChatSecretService({
        id: v4(),
      });
    service.prepare(func);

    const first: IChatGptSchema.IParameters | null = service.parameters(
      func.separated.human,
    );
    typia.assertGuard<IChatGptSchema.IParameters>(first);

    await service.fill({
      human: func.separated.human,
      arguments: {
        body: {
          secretKey: "google-secret-key",
        },
      },
    });

    const second: IChatGptSchema.IParameters | null = service.parameters(
      func.separated.human,
    );
    TestValidator.equals("second")(second)(null);

    const filled: any = await service.fill({
      human: func.separated.human,
      arguments: {},
    });
    TestValidator.equals("filled")(filled)({
      body: {
        secretKey: "google-secret-key",
      },
    });
  };
