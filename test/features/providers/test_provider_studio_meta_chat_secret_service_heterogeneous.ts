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

export const test_provider_studio_meta_chat_secret_service_heterogeneous =
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
        (f) =>
          f.path === "/connector/google-calendar/{calendarId}/event" &&
          f.method === "post",
      );
    typia.assertGuard<IHttpLlmFunction<"chatgpt">>(func);
    typia.assertGuard<IChatGptSchema.IParameters>(func.separated?.human);

    const service: StudioMetaChatSecretService =
      new StudioMetaChatSecretService({
        id: v4(),
      });
    service.prepare(func);

    // FIRST FILLING
    {
      const shrunk: IChatGptSchema.IParameters | null = service.parameters(
        func.separated.human,
      );
      typia.assertGuard<IChatGptSchema.IParameters>(shrunk);
      TestValidator.equals("first arguments")(
        HttpLlm.mergeParameters({
          function: func,
          llm: LLM_ARGUMENTS,
          human: await service.fill({
            human: func.separated.human,
            arguments: {
              body: {
                secretKey: "google-secret-key",
              },
            },
          }),
        }),
      )(EXPECTED_ARGUMENTS);
    }

    // AFTER CACHING
    {
      const shrunk: IChatGptSchema.IParameters | null = service.parameters(
        func.separated.human,
      );
      TestValidator.equals("second shrunk")(shrunk)(null);
      TestValidator.equals("second arguments")(
        HttpLlm.mergeParameters({
          function: func,
          llm: LLM_ARGUMENTS,
          human: await service.fill({
            human: func.separated.human,
            arguments: {},
          }),
        }),
      )(EXPECTED_ARGUMENTS);
    }
  };

const LLM_ARGUMENTS = {
  calendarId: "primary",
  body: {
    end: { date: 2, hour: 20, month: 10, year: 2024 },
    location: "회의실 C",
    start: { date: 2, hour: 19, month: 10, year: 2024 },
    title: "중요 회의",
  },
};

const EXPECTED_ARGUMENTS = {
  calendarId: "primary",
  body: {
    end: { date: 2, hour: 20, month: 10, year: 2024 },
    location: "회의실 C",
    start: { date: 2, hour: 19, month: 10, year: 2024 },
    title: "중요 회의",
    secretKey: "google-secret-key",
  },
};
