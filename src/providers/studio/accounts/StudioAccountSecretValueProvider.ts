import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { ICodeEntity } from "@wrtnlabs/os-api/lib/structures/common/ICodeEntity";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioAccountSecretValue } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecretValue";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { StudioAccountProvider } from "./StudioAccountProvider";
import { StudioAccountSecretProvider } from "./StudioAccountSecretProvider";
import { StudioAccountSecretValueScopeProvider } from "./StudioAccountSecretValueScopeProvider";

export namespace StudioAccountSecretValueProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.studio_account_secret_valuesGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioAccountSecretValue => ({
      id: input.id,
      code: input.code,
      value: decrypt(input.value),
      created_at: input.created_at.toISOString(),
      updated_at: input.updated_at.toISOString(),
      expired_at: input.expired_at?.toISOString() ?? null,
      scopes: input.scopes
        .sort((a, b) => a.sequence - b.sequence)
        .map((scope) => scope.value),
    });
    export const select = () => ({
      include: {
        scopes: true,
      },
    });
  }

  export namespace invertSummarize {
    export const transform = (
      input: Prisma.studio_account_secret_valuesGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioAccountSecretValue.IInvertSummary => ({
      id: input.id,
      code: input.code,
      created_at: input.created_at.toISOString(),
      updated_at: input.updated_at.toISOString(),
      expired_at: input.expired_at?.toISOString() ?? null,
      secret: StudioAccountSecretProvider.invert.transform(input.secret),
      scopes: input.scopes
        .sort((a, b) => a.sequence - b.sequence)
        .map((scope) => scope.value),
    });
    export const select = () => ({
      select: {
        id: true,
        code: true,
        created_at: true,
        updated_at: true,
        expired_at: true,
        secret: StudioAccountSecretProvider.invert.select(),
        scopes: true,
      },
    });
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    account: ICodeEntity;
    input: IStudioAccountSecretValue.IRequest;
  }): Promise<IPage<IStudioAccountSecretValue.IInvertSummary>> => {
    const accountRec = await StudioAccountProvider.find({
      payload: {},
      actor: props.actor,
      target: props.account,
      title: "member",
    });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.studio_account_secret_values,
      payload: invertSummarize.select(),
      transform: invertSummarize.transform,
    })({
      where: {
        AND: [
          {
            secret: {
              studio_account_id: accountRec.id,
            },
          },
          ...search(props.input.search),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ sequence: "asc" }],
    } satisfies Prisma.studio_account_secret_valuesFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    account: ICodeEntity;
    secret: IEntity;
    id: string;
  }): Promise<IStudioAccountSecretValue> => {
    const accountRec = await StudioAccountProvider.find({
      payload: {},
      actor: props.actor,
      target: props.account,
      title: "member",
    });
    const record =
      await HubGlobal.prisma.studio_account_secret_values.findFirstOrThrow({
        where: {
          id: props.id,
          secret: {
            studio_account_id: accountRec.id,
          },
        },
        ...json.select(),
      });
    return json.transform(record);
  };

  const search = (
    input: IStudioAccountSecretValue.IRequest.ISearch | undefined,
  ) =>
    [
      ...(input?.code?.length
        ? [
            {
              code: {
                contains: input.code,
                mode: "insensitive" as const,
              },
            },
          ]
        : []),
      ...(input?.secret
        ? StudioAccountSecretProvider.search(input.secret).map((secret) => ({
            secret,
          }))
        : []),
    ] satisfies Prisma.studio_account_secret_valuesWhereInput["AND"];

  const orderBy = (
    key: IStudioAccountSecretValue.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    (key === "value.code"
      ? { code: direction }
      : key === "value.created_at"
        ? { created_at: direction }
        : key === "value.updated_at"
          ? { updated_at: direction }
          : key === "value.expired_at"
            ? { expired_at: direction }
            : key === "value.sequence"
              ? { sequence: direction }
              : {
                  secret: StudioAccountSecretProvider.orderBy(key, direction),
                }) satisfies Prisma.studio_account_secret_valuesOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const collect = (props: {
    customer: IHubCustomer;
    input: IStudioAccountSecretValue.ICreate;
    sequence: number;
  }) => {
    if (props.customer.member === null) {
      throw ErrorProvider.badRequest({
        accessor: "customer",
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You are not a member.",
      });
    }

    return {
      id: v4(),
      customer: {
        connect: { id: props.customer.id },
      },
      member: {
        connect: {
          id: props.customer.member.id,
        },
      },
      code: props.input.code,
      value: encrypt(props.input.value),
      created_at: new Date(),
      updated_at: new Date(),
      expired_at: props.input.expired_at
        ? new Date(props.input.expired_at)
        : null,
      sequence: props.sequence,
    } satisfies Prisma.studio_account_secret_valuesCreateWithoutSecretInput;
  };

  export const create = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    secret: IEntity;
    input: IStudioAccountSecretValue.ICreate;
  }): Promise<IStudioAccountSecretValue> => {
    const secret = await StudioAccountSecretProvider.find({
      payload: {},
      actor: props.customer,
      account: props.account,
      target: props.secret,
    });
    const sequence: number =
      await HubGlobal.prisma.studio_account_secret_values.count({
        where: {
          secret: {
            studio_account_id: secret.studio_account_id,
          },
        },
      });
    const record = await HubGlobal.prisma.studio_account_secret_values.create({
      data: {
        ...collect({
          ...props,
          sequence: sequence + 1,
        }),
        secret: {
          connect: { id: secret.id },
        },
        scopes: {
          create: props.input.scopes.map((scopeValue, i) => ({
            id: v4(),
            value: scopeValue,
            sequence: i,
          })),
        },
        sequence,
      },
      ...json.select(),
    });
    return json.transform(record);
  };

  export const update = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    secret: IEntity;
    id: string;
    input: IStudioAccountSecretValue.IUpdate;
  }): Promise<void> => {
    const accountRec = await StudioAccountProvider.find({
      payload: {},
      actor: props.customer,
      target: props.account,
      title: "member",
    });
    await HubGlobal.prisma.studio_account_secret_values.update({
      where: {
        id: props.id,
        secret: {
          id: props.secret.id,
          studio_account_id: accountRec.id,
        },
      },
      data: {
        code: props.input.code,
        value: props.input.value
          ? AesPkcs5.encrypt(
              props.input.value,
              HubGlobal.env.STUDIO_ACCOUNT_SECRET_VALUE_ENCRYPTION_KEY,
              HubGlobal.env.STUDIO_ACCOUNT_SECRET_VALUE_ENCRYPTION_IV,
            )
          : undefined,
        expired_at: props.input.expired_at,
      },
    });
    if (props.input.scopes !== undefined)
      await StudioAccountSecretValueScopeProvider.remake({
        value: { id: props.id },
        scopes: props.input.scopes,
      });
  };

  export const erase = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    secret: IEntity;
    id: string;
  }): Promise<void> => {
    const accountRec = await StudioAccountProvider.find({
      payload: {},
      actor: props.customer,
      target: props.account,
      title: "member",
    });
    await HubGlobal.prisma.studio_account_secret_values.delete({
      where: {
        id: props.id,
        secret: {
          id: props.secret.id,
          studio_account_id: accountRec.id,
        },
      },
    });

    const count: number =
      await HubGlobal.prisma.studio_account_secret_values.count({
        where: {
          studio_account_secret_id: props.secret.id,
        },
      });
    if (count === 0)
      await HubGlobal.prisma.studio_account_secrets.delete({
        where: {
          id: props.secret.id,
        },
      });
  };

  export const decrypt = (value: string): string =>
    AesPkcs5.decrypt(
      value,
      HubGlobal.env.STUDIO_ACCOUNT_SECRET_VALUE_ENCRYPTION_KEY,
      HubGlobal.env.STUDIO_ACCOUNT_SECRET_VALUE_ENCRYPTION_IV,
    );

  export const encrypt = (value: string): string =>
    AesPkcs5.encrypt(
      value,
      HubGlobal.env.STUDIO_ACCOUNT_SECRET_VALUE_ENCRYPTION_KEY,
      HubGlobal.env.STUDIO_ACCOUNT_SECRET_VALUE_ENCRYPTION_IV,
    );
}
