import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import {
  ChatGptTypeChecker,
  IChatGptSchema,
  OpenApi,
  OpenApiTypeChecker,
} from "@samchon/openapi";
import typia, { tags } from "typia";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IStudioAccountSecretValueSandbox } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecretValueSandbox";

import { HubGlobal } from "../../../HubGlobal";
import { StudioAccountSecretValueProvider } from "./StudioAccountSecretValueProvider";

export namespace StudioAccountSecretValueSandboxProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.studio_account_secret_value_sandboxesGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioAccountSecretValueSandbox => ({
      id: input.id,
      key: input.value.secret.key,
      code: input.value.code,
      value: StudioAccountSecretValueProvider.decrypt(input.value.value),
      scopes: input.value.scopes
        .sort((a, b) => a.sequence - b.sequence)
        .map((s) => s.value),
    });
    export const select = () =>
      ({
        include: {
          value: {
            include: {
              scopes: true,
              secret: true,
            },
          },
        },
      }) satisfies Prisma.studio_account_secret_value_sandboxesFindManyArgs;
  }

  export const at = async (
    id: string,
  ): Promise<IStudioAccountSecretValueSandbox> => {
    const sandbox =
      await HubGlobal.prisma.studio_account_secret_value_sandboxes.findFirstOrThrow(
        {
          where: { id },
          ...json.select(),
        },
      );
    return json.transform(sandbox);
  };

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export interface ISource {
    table: string;
    id: string & tags.Format<"uuid">;
  }

  export const emplace = (props: { value: IEntity; reference: ISource }) =>
    HubGlobal.prisma.studio_account_secret_value_sandboxes.upsert({
      where: {
        source_table_source_id_studio_account_secret_value_id: {
          studio_account_secret_value_id: props.value.id,
          source_id: props.reference.id,
          source_table: props.reference.table,
        },
      },
      create: {
        id: v4(),
        studio_account_secret_value_id: props.value.id,
        source_id: props.reference.id,
        source_table: props.reference.table,
        created_at: new Date(),
      },
      update: {},
    });

  export const update = async (props: {
    id: string;
    input: IStudioAccountSecretValueSandbox.IUpdate;
  }): Promise<void> => {
    const sandbox =
      await HubGlobal.prisma.studio_account_secret_value_sandboxes.findFirstOrThrow(
        {
          where: { id: props.id },
          select: { studio_account_secret_value_id: true },
        },
      );
    await HubGlobal.prisma.studio_account_secret_values.update({
      where: { id: sandbox.studio_account_secret_value_id },
      data: {
        value: StudioAccountSecretValueProvider.encrypt(props.input.value),
        updated_at: new Date(),
      },
    });
  };

  export const clear = async (reference: ISource): Promise<void> => {
    await HubGlobal.prisma.studio_account_secret_value_sandboxes.deleteMany({
      where: {
        source_id: reference.id,
        source_table: reference.table,
      },
    });
  };

  /* -----------------------------------------------------------
    ENCODERS
  ----------------------------------------------------------- */
  export interface ILlmSchemaContext {
    source: ISource;
    $defs: Record<string, IChatGptSchema>;
    schema: IChatGptSchema;
    input: any;
  }

  export const encodeLlmSchema = async (
    ctx: ILlmSchemaContext,
  ): Promise<any> => {
    await visitLlmSchema(ctx, (str) => {
      ctx.input = str;
    });
    return ctx.input;
  };

  const visitLlmSchema = async (
    ctx: ILlmSchemaContext,
    setter: (str: string) => void,
  ): Promise<any> => {
    if (ChatGptTypeChecker.isString(ctx.schema)) {
      if (ctx.schema["x-wrtn-secret-key"] && typeof ctx.input === "string")
        await take({
          reference: ctx.source,
          input: ctx.input,
          setter,
        });
    } else if (ChatGptTypeChecker.isAnyOf(ctx.schema))
      await ArrayUtil.asyncForEach(ctx.schema.anyOf)((schema) =>
        visitLlmSchema(
          {
            ...ctx,
            schema,
          },
          setter,
        ),
      );
    else if (ChatGptTypeChecker.isArray(ctx.schema)) {
      if (Array.isArray(ctx.input))
        await ArrayUtil.asyncForEach(ctx.input)((elem, i, array) =>
          visitLlmSchema(
            {
              source: ctx.source,
              $defs: ctx.$defs,
              schema: (ctx.schema as IChatGptSchema.IArray).items,
              input: elem,
            },
            (str) => ((array as any[])[i] = str),
          ),
        );
    } else if (ChatGptTypeChecker.isObject(ctx.schema)) {
      if (typeof ctx.input === "object" && ctx.input !== null) {
        if (ctx.schema.properties)
          await ArrayUtil.asyncMap(Object.entries(ctx.schema.properties))(
            async ([key, schema]) =>
              visitLlmSchema(
                {
                  source: ctx.source,
                  $defs: ctx.$defs,
                  schema,
                  input: ctx.input[key],
                },
                (str) => (ctx.input[key] = str),
              ),
          );
      }
    } else if (ChatGptTypeChecker.isReference(ctx.schema)) {
      const key: string = ctx.schema.$ref.split("/").pop() ?? "";
      const schema: IChatGptSchema | undefined = ctx.$defs[key];
      if (schema)
        await visitLlmSchema(
          {
            source: ctx.source,
            $defs: ctx.$defs,
            schema,
            input: ctx.input,
          },
          setter,
        );
    }
  };

  const take = async (props: {
    reference: ISource;
    input: string;
    setter: (str: string) => void;
  }): Promise<void> => {
    if (isUuid(props.input) === false) return;
    try {
      const sv =
        await HubGlobal.prisma.studio_account_secret_values.findFirstOrThrow({
          where: { id: props.input },
          select: { id: true, value: true },
        });
      const sandbox = await emplace({
        reference: props.reference,
        value: sv,
      });
      return props.setter(sandbox.id);
    } catch {}
  };

  /* -----------------------------------------------------------
    DECODERS
  ----------------------------------------------------------- */
  export interface IJsonSchemaContext {
    source: ISource;
    schema: OpenApi.IJsonSchema;
    components: OpenApi.IComponents;
    input: any;
  }

  export const encodeJsonSchema = async (
    ctx: IJsonSchemaContext,
  ): Promise<any> => {
    await visitJsonSchema(ctx, (str) => {
      ctx.input = str;
    });
    return ctx.input;
  };

  const visitJsonSchema = async (
    ctx: IJsonSchemaContext,
    setter: (str: string) => void,
  ): Promise<any> => {
    if (OpenApiTypeChecker.isString(ctx.schema)) {
      if (ctx.schema["x-wrtn-secret-key"] && typeof ctx.input === "string")
        await take({
          reference: ctx.source,
          input: ctx.input,
          setter,
        });
    } else if (OpenApiTypeChecker.isOneOf(ctx.schema))
      await ArrayUtil.asyncForEach(ctx.schema.oneOf)((schema) =>
        visitJsonSchema(
          {
            ...ctx,
            schema,
          },
          setter,
        ),
      );
    else if (OpenApiTypeChecker.isArray(ctx.schema)) {
      if (Array.isArray(ctx.input))
        await ArrayUtil.asyncForEach(ctx.input)((elem, i, array) =>
          visitJsonSchema(
            {
              source: ctx.source,
              schema: (ctx.schema as OpenApi.IJsonSchema.IArray).items,
              components: ctx.components,
              input: elem,
            },
            (str) => ((array as any[])[i] = str),
          ),
        );
    } else if (OpenApiTypeChecker.isTuple(ctx.schema)) {
      if (Array.isArray(ctx.input)) {
        await ArrayUtil.asyncForEach(ctx.schema.prefixItems)((schema, i) =>
          visitJsonSchema(
            {
              source: ctx.source,
              schema,
              components: ctx.components,
              input: ctx.input[i],
            },
            (str) => (ctx.input[i] = str),
          ),
        );
        if (
          typeof ctx.schema.additionalItems === "object" &&
          ctx.schema.additionalItems !== null
        )
          await ArrayUtil.asyncForEach(
            ctx.input.slice(ctx.schema.prefixItems.length),
          )((elem, i, array) =>
            visitJsonSchema(
              {
                source: ctx.source,
                schema: (ctx.schema as OpenApi.IJsonSchema.ITuple)
                  .additionalItems as OpenApi.IJsonSchema,
                components: ctx.components,
                input: elem,
              },
              (str) => ((array as any[])[i] = str),
            ),
          );
      }
    } else if (OpenApiTypeChecker.isObject(ctx.schema)) {
      if (typeof ctx.input === "object" && ctx.input !== null) {
        if (ctx.schema.properties)
          await ArrayUtil.asyncMap(Object.entries(ctx.schema.properties))(
            async ([key, schema]) =>
              visitJsonSchema(
                {
                  source: ctx.source,
                  schema,
                  components: ctx.components,
                  input: ctx.input[key],
                },
                (str) => (ctx.input[key] = str),
              ),
          );
        if (
          typeof ctx.schema.additionalProperties === "object" &&
          ctx.schema.additionalProperties !== null
        ) {
          await ArrayUtil.asyncMap(
            Object.keys(ctx.input).filter(
              ctx.schema.properties
                ? (key) =>
                    (ctx.schema as OpenApi.IJsonSchema.IObject).properties![
                      key
                    ] === undefined
                : () => true,
            ),
          )(async (key) =>
            visitJsonSchema(
              {
                source: ctx.source,
                schema: (ctx.schema as OpenApi.IJsonSchema.IObject)
                  .additionalProperties as OpenApi.IJsonSchema,
                components: ctx.components,
                input: ctx.input[key],
              },
              (str) => (ctx.input[key] = str),
            ),
          );
        }
      }
    } else if (OpenApiTypeChecker.isReference(ctx.schema)) {
      const schema =
        ctx.components.schemas?.[ctx.schema.$ref.split("/").pop() ?? ""];
      if (schema)
        await visitJsonSchema(
          {
            source: ctx.source,
            schema,
            components: ctx.components,
            input: ctx.input,
          },
          setter,
        );
    }
  };
}

const isUuid = typia.createIs<string & tags.Format<"uuid">>();
