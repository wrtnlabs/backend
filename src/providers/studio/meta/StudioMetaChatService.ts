import { Agentica, IAgenticaEvent } from "@agentica/core";
import { ArrayUtil, RandomGenerator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import { HttpLlm, IChatGptSchema, IHttpResponse } from "@samchon/openapi";
import ShoppingApi from "@samchon/shopping-api";
import { createHash } from "crypto";
import OpenAI from "openai";

import { IStudioAccountLlmKey } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountLlmKey";
import { IStudioMetaChatListener } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatListener";
import { IStudioMetaChatService } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatService";
import { IStudioMetaChatServiceDialogue } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceDialogue";
import { IStudioMetaChatServiceFillArguments } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceFillArguments";
import { IStudioMetaChatServiceProps } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceProps";
import { IStudioMetaChatServiceTokenUsage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceTokenUsage";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { HubGlobal } from "../../../HubGlobal";
import { StudioAccountLlmKeyProvider } from "../accounts/StudioAccountLlmKeyProvider";
import { StudioMetaChatFreeLimitProvider } from "./StudioMetaChatFreeLimitProvider";
import { StudioMetaChatSecretService } from "./StudioMetaChatSecretService";
import { StudioMetaChatServiceOperationProvider } from "./StudioMetaChatServiceOperationProvider";
import { StudioMetaChatSessionMessageProvider } from "./StudioMetaChatSessionMessageProvider";
import { StudioMetaChatSessionTokenUsageProvider } from "./StudioMetaChatSessionTokenUsageProvider";

export class StudioMetaChatService implements IStudioMetaChatService {
  private agent_: Agentica<"chatgpt"> | null;
  private llmKey: IStudioAccountLlmKey.IEmplace | null;
  private readonly secret: StudioMetaChatSecretService;

  /* -----------------------------------------------------------
    CONSTRUCTORS
  ----------------------------------------------------------- */
  public constructor(private readonly props: IStudioMetaChatServiceProps) {
    this.agent_ = null;
    this.llmKey = null;
    this.secret = new StudioMetaChatSecretService(this.props.connection);
  }

  public async initialize(
    props?: Partial<IStudioMetaChatService.IProps> | undefined,
  ): Promise<IStudioMetaChatSession> {
    //----
    // CONSTRUCT AGENT
    //----
    // CHECK STATUS
    if (this.agent_ !== null)
      throw new Error("The service has already been initialized.");

    // LLM SECRET KEY
    if (props?.llm_key)
      this.llmKey = await StudioAccountLlmKeyProvider.invert({
        account: {
          code: props.llm_key.account_code,
        },
        code: props.llm_key.code,
        customer: this.props.customer,
      });
    else await StudioMetaChatFreeLimitProvider.assert(this.props.customer);

    this.agent_ = new Agentica({
      model: "chatgpt",
      vendor: {
        model: "gpt-4o-mini",
        api: new OpenAI({
          apiKey: this.llmKey?.value ?? HubGlobal.env.OPENAI_API_KEY,
        }),
      },
      controllers: await ArrayUtil.asyncMap(this.props.controllers)(
        async (controller, i) => {
          const connection: IConnection = {
            host:
              (HubGlobal.mode !== "real"
                ? (controller.swagger.servers?.[1]?.url ??
                  controller.swagger.servers?.[0]?.url)
                : controller.swagger.servers?.[0]?.url) ??
              "http://localhost:3000",
          };
          return {
            protocol: "http",
            name: `h${i}`,
            application: controller.application,
            connection: await this.handshakeSamchonShopping(connection),
          };
        },
      ),
      config: {
        locale: this.props.customer.lang_code ?? "en-US",
        timezone: this.props.timezone,
      },
    });

    //----
    // EVENT LISTENERS
    //----
    const listener: IStudioMetaChatListener = this.props.listener;
    this.agent_.on("initialize", async () => {
      listener.initialize!().catch(() => {});
    });
    this.agent_.on("text", async (event) => {
      listener
        .talk({
          type: "text",
          text: event.text,
        })
        .catch(() => {});
    });
    this.agent_.on("select", async (event) => {
      listener
        .selectFunction({
          operation: StudioMetaChatServiceOperationProvider.transform(
            event.operation,
          ),
          reason: event.reason,
        })
        .catch(() => {});
    });
    this.agent_.on("cancel", async (event) => {
      listener
        .cancelFunction({
          operation: StudioMetaChatServiceOperationProvider.transform(
            event.operation,
          ),
          reason: event.reason,
        })
        .catch(() => {});
    });
    this.agent_.on("call", (event) => this.handleFunctionCall(event));
    this.agent_.on("execute", (event) => {
      const response: IHttpResponse = event.value;
      listener
        .completeFunction({
          id: event.id,
          operation: StudioMetaChatServiceOperationProvider.transform(
            event.operation,
          ),
          arguments: event.arguments,
          value: response.body,
          status: response.status,
          created_at: new Date().toISOString(), // @todo
          completed_at: new Date().toISOString(), // @todo
        })
        .catch(() => {});
    });
    this.agent_.on("response", async () => {
      const computed: IStudioMetaChatServiceTokenUsage =
        await StudioMetaChatSessionTokenUsageProvider.emplace({
          session: this.props.session,
          usage: this.agent_!.getTokenUsage(),
        });
      listener.tokenUsage!(computed).catch(() => {});
    });

    return this.props.session;
  }

  /* -----------------------------------------------------------
    ACCESSORS
  ----------------------------------------------------------- */
  public async talk(dialogue: IStudioMetaChatServiceDialogue): Promise<void> {
    if (this.agent_ === null)
      throw new Error("The service has not been initialized yet.");
    else if (this.llmKey === null)
      await StudioMetaChatFreeLimitProvider.assert(this.props.customer);

    const created_at: Date = new Date();
    try {
      await this.agent_.conversate(dialogue.text);
    } catch {}
    StudioMetaChatSessionMessageProvider.create({
      id: this.props.session.id,
      session: this.props.session,
      connection: this.props.connection,
      speaker: "user",
      type: "text",
      arguments: [dialogue],
      value: undefined,
      created_at,
    }).catch(() => {});
  }

  /**
   * @todo Not implemented yet
   */
  public async abort(): Promise<void> {}

  public async getTokenUsage(): Promise<IStudioMetaChatServiceTokenUsage> {
    if (this.agent_ === null)
      throw new Error("The service has not been initialized yet.");
    return StudioMetaChatSessionTokenUsageProvider.computeAll(
      this.agent_.getTokenUsage(),
    );
  }

  /* -----------------------------------------------------------
    EVENT HANDLERS
  ----------------------------------------------------------- */
  private async handleFunctionCall(
    event: IAgenticaEvent.ICall<"chatgpt">,
  ): Promise<void> {
    if (!event.operation.function.separated?.human) return;

    this.secret.prepare(event.operation.function);
    const shrunk: IChatGptSchema.IParameters | null = this.secret.parameters(
      event.operation.function.separated.human,
    );
    try {
      const result: IStudioMetaChatServiceFillArguments.IResponse =
        await this.props.listener.fillArguments({
          operation: StudioMetaChatServiceOperationProvider.transform(
            event.operation,
          ),
          parameters: shrunk ?? event.operation.function.separated.human,
          llm: event.operation.function.separated.llm
            ? {
                parameters: event.operation.function.separated.llm,
                arguments: event.arguments,
              }
            : null,
        });
      if (result.determinant === "accept")
        event.arguments = HttpLlm.mergeParameters({
          function: event.operation.function,
          human: shrunk
            ? this.secret.fill({
                human: event.operation.function.separated.human,
                arguments: result.arguments,
              })
            : result.arguments,
          llm: event.arguments,
        });
      else {
        // @todo rejection case
      }
    } catch {
      // @todo rejection by error
    }
  }

  private async handshakeSamchonShopping(
    connection: IConnection,
  ): Promise<IConnection> {
    if (connection.host === "https://shopping-be.wrtn.ai") return connection;
    const customer =
      await ShoppingApi.functional.shoppings.customers.authenticate.create(
        connection,
        {
          ip: this.props.customer.ip,
          href: this.props.customer.href,
          referrer: this.props.customer.referrer,
          channel_code: "samchon",
          external_user: {
            application: "wrtn",
            uid: createHash("sha1")
              .update(this.props.customer.member!.nickname)
              .digest("hex"),
            password: createHash("sha256")
              .update(this.props.customer.member!.nickname)
              .digest("hex"),
            nickname: this.props.customer.member!.nickname,
            citizen: null,
            data: null,
          },
        },
      );
    if (customer.citizen === null)
      await ShoppingApi.functional.shoppings.customers.authenticate.activate(
        connection,
        {
          name: this.props.customer.member!.nickname,
          mobile: RandomGenerator.mobile(),
        },
      );
    return connection;
  }
}
