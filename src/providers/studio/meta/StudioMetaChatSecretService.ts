import { ArrayUtil } from "@nestia/e2e";
import {
  ChatGptTypeChecker,
  IChatGptSchema,
  ILlmFunction,
  ILlmSchema,
} from "@samchon/openapi";
import { ChatGptSchemaComposer } from "@samchon/openapi/lib/composers/llm/ChatGptSchemaComposer";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { MapUtil } from "@wrtnlabs/os-api/lib/utils";

import { StudioAccountSecretValueSandboxProvider } from "../accounts/StudioAccountSecretValueSandboxProvider";

export class StudioMetaChatSecretService {
  private readonly connection: IEntity;
  private readonly secrets: Map<string, ISecret> = new Map();

  public constructor(connection: IEntity) {
    this.connection = connection;
  }

  public prepare(func: ILlmFunction<"chatgpt">): void {
    if (!func.separated?.human) return;
    ChatGptTypeChecker.visit({
      $defs: func.separated.human.$defs,
      schema: func.separated.human,
      closure: (schema) => {
        if (
          ChatGptTypeChecker.isString(schema) &&
          schema["x-wrtn-secret-key"]
        ) {
          const secret: ISecret = MapUtil.take(this.secrets)(
            schema["x-wrtn-secret-key"],
            () => ({
              key: schema["x-wrtn-secret-key"]!,
              scopes: new Set(),
              value: undefined,
            }),
          );
          for (const scope of schema["x-wrtn-secret-scopes"] ?? [])
            secret.scopes.add(scope);
        }
      },
    });
  }

  public parameters(
    parameters: ILlmSchema.IParameters<"chatgpt">,
  ): ILlmSchema.IParameters<"chatgpt"> | null {
    const unique: Set<string> = new Set(
      Array.from(this.secrets.entries())
        .filter(([_k, v]) => v.value !== undefined)
        .map(([k]) => k),
    );
    const separated: ILlmFunction.ISeparated<"chatgpt"> =
      ChatGptSchemaComposer.separateParameters({
        convention: (key, type) =>
          `${key}.${type === "human" ? "Human.Cached" : "Human.Manual"}`,
        predicate: (schema) => {
          // LLM is human
          // Human is cached
          if (
            ChatGptTypeChecker.isString(schema) &&
            schema["x-wrtn-secret-key"] !== undefined
          ) {
            // cached, then human
            if (unique.has(schema["x-wrtn-secret-key"]) === true) return true;
            unique.add(schema["x-wrtn-secret-key"]);
            return false;
          }
          return false;
        },
        parameters,
      });
    return Object.keys(separated.llm.properties).length === 0
      ? null
      : separated.llm;
  }

  public fill(props: {
    human: ILlmSchema.IParameters<"chatgpt">;
    arguments: any;
  }): Promise<any> {
    return this.fillSchema({
      $defs: props.human.$defs,
      schema: props.human,
      value: props.arguments,
    });
  }

  private async fillSchema(props: {
    $defs: Record<string, IChatGptSchema>;
    schema: IChatGptSchema;
    value: any;
  }): Promise<any> {
    if (ChatGptTypeChecker.isAnyOf(props.schema)) {
      let output: any = undefined;
      for (const item of props.schema.anyOf)
        output ??= await this.fillSchema({
          ...props,
          schema: item,
        });
      return output;
    } else if (
      ChatGptTypeChecker.isString(props.schema) &&
      props.schema["x-wrtn-secret-key"] !== undefined
    ) {
      const secret: ISecret | undefined = this.secrets.get(
        props.schema["x-wrtn-secret-key"],
      );
      if (secret === undefined) return props.value;
      else if (props.value === undefined) return secret.value;
      else if (typeof props.value === "string") {
        secret.value =
          await StudioAccountSecretValueSandboxProvider.encodeLlmSchema({
            source: {
              table: "studio_meta_chat_session_connections",
              id: this.connection.id,
            },
            $defs: props.$defs,
            schema: props.schema,
            input: props.value,
          });
        return secret.value;
      }
    } else if (
      ChatGptTypeChecker.isArray(props.schema) &&
      (props.value === undefined || Array.isArray(props.value))
    ) {
      if (props.value === undefined) props.value = [];
      const items: IChatGptSchema = props.schema.items;
      return ArrayUtil.asyncMap(props.value)((elem) =>
        this.fillSchema({
          ...props,
          schema: items,
          value: elem,
        }),
      );
    } else if (
      ChatGptTypeChecker.isObject(props.schema) &&
      (props.value === undefined ||
        (typeof props.value === "object" && props.value !== null))
    ) {
      if (props.value === undefined) props.value = {};
      const properties: Record<string, IChatGptSchema> =
        props.schema.properties ?? {};
      const regular = Object.fromEntries(
        await ArrayUtil.asyncMap(Object.entries(properties))(
          async ([k, s]) =>
            [
              k,
              await this.fillSchema({
                ...props,
                value: props.value[k],
                schema: s,
              }),
            ] as const,
        ),
      );
      const additionalProperties: IChatGptSchema | boolean | undefined =
        props.schema.additionalProperties;
      const dynamic =
        additionalProperties === true
          ? Object.entries(props.value).filter(
              ([k]) => properties[k] === undefined,
            )
          : typeof additionalProperties === "object" &&
              additionalProperties !== null
            ? Object.fromEntries(
                await ArrayUtil.asyncMap(
                  Object.entries(props.value).filter(
                    ([k]) => properties[k] === undefined,
                  ),
                )(
                  async ([k, v]) =>
                    [
                      k,
                      this.fillSchema({
                        ...props,
                        schema: additionalProperties,
                        value: v,
                      }),
                    ] as const,
                ),
              )
            : {};
      return {
        ...props.value,
        ...regular,
        ...dynamic,
      };
    } else if (ChatGptTypeChecker.isReference(props.schema)) {
      const schema: IChatGptSchema | undefined =
        props.$defs[props.schema.$ref.split("/").pop() ?? ""];
      if (schema)
        return this.fillSchema({
          ...props,
          schema,
        });
    }
    return props.value;
  }
}
interface ISecret {
  key: string;
  scopes: Set<string>;
  value: string | undefined;
}
