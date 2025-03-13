import { IAgenticaController } from "@agentica/core";
import {
  ChatGptTypeChecker,
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
  OpenApiV3,
  OpenApiV3_1,
  SwaggerV2,
} from "@samchon/openapi";
import { Singleton, sleep_for } from "tstl";
import typia from "typia";
import { v4 } from "uuid";

import { IStudioMetaChatService } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatService";
import { IStudioMetaChatServiceCompleteFunction } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceCompleteFunction";
import { IStudioMetaChatServiceDialogue } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceDialogue";
import { IStudioMetaChatServiceFillArguments } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceFillArguments";
import { IStudioMetaChatServiceOperation } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceOperation";
import { IStudioMetaChatServiceProps } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceProps";
import { IStudioMetaChatServiceTokenUsage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceTokenUsage";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { StudioMetaChatSessionTokenUsageProvider } from "./StudioMetaChatSessionTokenUsageProvider";

export class StudioMetaChatMockService implements IStudioMetaChatService {
  private count_: number = 0;
  private readonly controller_: Singleton<
    Promise<IAgenticaController.IHttp<"chatgpt">>
  >;
  private readonly function_: Singleton<Promise<IHttpLlmFunction<"chatgpt">>>;

  public constructor(private readonly props: IStudioMetaChatServiceProps) {
    this.controller_ = new Singleton(async () => {
      const document:
        | SwaggerV2.IDocument
        | OpenApiV3.IDocument
        | OpenApiV3_1.IDocument = await fetch(
        "https://wrtnlabs.github.io/connectors/swagger/swagger.json",
      ).then((r) => r.json());
      const application: IHttpLlmApplication<"chatgpt"> = HttpLlm.application({
        model: "chatgpt",
        document: OpenApi.convert(document),
        options: {
          separate: (schema) =>
            ChatGptTypeChecker.isString(schema) &&
            schema["x-wrtn-secret-key"] !== undefined,
        },
      });
      return {
        protocol: "http",
        name: "h0",
        application,
        connection: null! as any,
      } satisfies IAgenticaController<"chatgpt">;
    });
    this.function_ = new Singleton(async () => {
      const { application } = await this.controller_.get();
      const func = application.functions.find(
        (x) => x.name === "connector_gmail_send",
      );
      if (func === undefined)
        throw new Error("connector_gmail_send not found.");
      return func;
    });
  }

  public async initialize(): Promise<IStudioMetaChatSession> {
    return this.props.session;
  }

  public async talk(dialogue: IStudioMetaChatServiceDialogue): Promise<void> {
    await this.handle(dialogue);
  }

  public async abort(): Promise<void> {
    throw new Error("unimplemented");
  }

  public async getTokenUsage(): Promise<IStudioMetaChatServiceTokenUsage> {
    return StudioMetaChatSessionTokenUsageProvider.zeroAll();
  }

  public async getControllers(): Promise<IAgenticaController<"chatgpt">[]> {
    return [await this.controller_.get()];
  }

  private async handle(
    dialogue: IStudioMetaChatServiceDialogue,
  ): Promise<void> {
    await sleep_for(50);
    typia.assert(dialogue);

    if (++this.count_ === 1) {
      await this.props.listener.talk({
        type: "text",
        text: [
          "이메일을 보내겠습니다, 다음 정보들을 입력해주세요:",
          "",
          " - 받는 사람의 이메일 주소 (필수)",
          " - 이메일 제목 (필수)",
          " - 이메일 본문 (필수)",
          " - 참조할 사람 이메일",
          " - 숨은 참조 이메일",
        ].join("\n"),
      });
    } else if (this.count_ === 2)
      await this.props.listener.talk({
        type: "text",
        text: "보내고자 하는 메일의 내용은 blah~ blah~ 입니다. 이메일을 이대로 보내시겠습니까?",
      });
    else if (this.count_ === 3) {
      const func = await this.function_.get();
      const operation: IStudioMetaChatServiceOperation = {
        protocol: "http",
        controller: "h0",
        function: func.name,
        name: func.name,
      };
      await this.props.listener.talk({
        type: "text",
        text: "네, 이메일을 보내도록 하겠습니다.",
      });
      await this.props.listener.selectFunction({
        reason: "User requested to send an email.",
        operation,
      });
      const filled: IStudioMetaChatServiceFillArguments.IResponse =
        await this.props.listener.fillArguments({
          operation,
          parameters: (await this.function_.get()).separated!.human!,
          llm: {
            parameters: (await this.function_.get()).separated!.llm!,
            arguments: {
              body: {
                to: ["jaxtyn@wrtn.io"],
                subject: "Hello World",
                body: "Hello, nice to meet you.",
              },
            },
          },
        });
      if (filled.determinant === "reject") return;

      const complete: IStudioMetaChatServiceCompleteFunction = {
        id: v4(),
        operation,
        arguments: {
          to: ["jaxtyn@wrtn.io"],
          subject: "Hello World",
          body: "Hello, nice to meet you.",
          secretKey: filled.arguments.secretKey,
        },
        value: {
          id: v4(),
        },
        created_at: new Date(Date.now() - 1000).toISOString(),
        completed_at: new Date().toISOString(),
        status: 201,
      };
      await this.props.listener.completeFunction(complete);
      await this.props.listener.describeFunctionCalls({
        completes: [complete],
        text: "이메일을 보냈습니다. 무엇을 더 도와드릴까요?",
      });
    }
  }
}
