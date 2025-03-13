import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { ICodeEntity } from "@wrtnlabs/os-api/lib/structures/common/ICodeEntity";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioAccountSecret } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecret";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../../hub/actors/HubCustomerProvider";
import { StudioAccountProvider } from "./StudioAccountProvider";
import { StudioAccountSecretValueProvider } from "./StudioAccountSecretValueProvider";
import { StudioAccountSecretValueScopeProvider } from "./StudioAccountSecretValueScopeProvider";

export namespace StudioAccountSecretProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.studio_account_secretsGetPayload<ReturnType<typeof select>>,
    ): IStudioAccountSecret => ({
      id: input.id,
      key: input.key,
      title: input.title,
      description: input.description,
      created_at: input.created_at.toISOString(),
      updated_at: input.updated_at.toISOString(),
      customer: HubCustomerProvider.json.transform(input.customer),
      values: input.values
        .sort((a, b) => a.sequence - b.sequence)
        .map(StudioAccountSecretValueProvider.json.transform),
    });
    export const select = () =>
      ({
        include: {
          customer: HubCustomerProvider.json.select(),
          values: StudioAccountSecretValueProvider.json.select(),
        },
      }) satisfies Prisma.studio_account_secretsFindManyArgs;
  }

  export namespace summarize {
    export const transform = (
      input: Prisma.studio_account_secretsGetPayload<ReturnType<typeof select>>,
    ): IStudioAccountSecret.ISummary => ({
      id: input.id,
      key: input.key,
      title: input.title,
      created_at: input.created_at.toISOString(),
      updated_at: input.updated_at.toISOString(),
      count: input.values.length,
    });
    export const select = () =>
      ({
        select: {
          id: true,
          key: true,
          title: true,
          created_at: true,
          updated_at: true,
          values: {
            select: {
              id: true,
            },
          },
        },
      }) satisfies Prisma.studio_account_secretsFindManyArgs;
  }

  export namespace invert {
    export const transform = (
      input: Prisma.studio_account_secretsGetPayload<ReturnType<typeof select>>,
    ): IStudioAccountSecret.IInvert => ({
      id: input.id,
      key: input.key,
      title: input.title,
      created_at: input.created_at.toISOString(),
      updated_at: input.updated_at.toISOString(),
    });
    export const select = () => ({});
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const dictionoary = async (
    actor: IHubActorEntity,
  ): Promise<Record<string, string[]>> => {
    if (actor.member === null || actor.member.account === null) return {};
    const records = await HubGlobal.prisma.studio_account_secrets.findMany({
      where: {
        studio_account_id: actor.member.account.id,
      },
      ...json.select(),
    });
    return Object.fromEntries(
      records
        .filter((r) => r.values.length !== 0)
        .map(
          (r) =>
            [
              r.key,
              r.values.map((v) =>
                StudioAccountSecretValueProvider.decrypt(v.value),
              ),
            ] as const,
        ),
    );
  };

  export const index = async (props: {
    actor: IHubActorEntity;
    account: ICodeEntity;
    input: IStudioAccountSecret.IRequest;
  }): Promise<IPage<IStudioAccountSecret.ISummary>> => {
    const accountRec = await StudioAccountProvider.find({
      payload: {},
      actor: props.actor,
      target: props.account,
      title: "member",
    });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.studio_account_secrets,
      payload: summarize.select(),
      transform: summarize.transform,
    })({
      where: {
        AND: [
          {
            studio_account_id: accountRec.id,
          },
          ...search(props.input.search),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "asc" }],
    } satisfies Prisma.studio_account_secretsFindManyArgs)(props.input);
  };

  export const find = async <
    Payload extends Prisma.studio_account_secretsFindManyArgs,
  >(props: {
    payload: Payload;
    actor: IHubActorEntity;
    account: ICodeEntity;
    target: IEntity | { key: string };
  }) => {
    const accountRec = await StudioAccountProvider.find({
      payload: {},
      actor: props.actor,
      target: props.account,
      title: "member",
    });
    const record =
      await HubGlobal.prisma.studio_account_secrets.findFirstOrThrow({
        where: {
          studio_account_id: accountRec.id,
          id: typia.is<IEntity>(props.target) ? props.target.id : undefined,
          key: typia.is<{ key: string }>(props.target)
            ? props.target.key
            : undefined,
        },
        ...props.payload,
      });
    return record as Prisma.studio_account_secretsGetPayload<Payload>;
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    account: ICodeEntity;
    id: string;
  }): Promise<IStudioAccountSecret> => {
    const record = await find({
      payload: json.select(),
      actor: props.actor,
      account: props.account,
      target: { id: props.id },
    });
    return json.transform(record);
  };

  export const get = async (props: {
    actor: IHubActorEntity;
    account: ICodeEntity;
    key: string;
  }): Promise<IStudioAccountSecret> => {
    const record = await find({
      payload: json.select(),
      actor: props.actor,
      account: props.account,
      target: { key: props.key },
    });
    return json.transform(record);
  };

  export const search = (
    input: IStudioAccountSecret.IRequest.ISearch | undefined,
  ) =>
    [
      ...(input?.key?.length
        ? [
            {
              key: {
                contains: input.key,
                mode: "insensitive" as const,
              },
            },
          ]
        : []),
      ...(input?.title?.length
        ? [
            {
              title: {
                contains: input.title,
                mode: "insensitive" as const,
              },
            },
          ]
        : []),
      ...(input?.description?.length
        ? [
            {
              description: {
                contains: input.description,
                mode: "insensitive" as const,
              },
            },
          ]
        : []),
      ...(input?.title_or_description?.length
        ? [
            {
              OR: [
                {
                  title: {
                    contains: input.title_or_description,
                    mode: "insensitive" as const,
                  },
                },
                {
                  description: {
                    contains: input.title_or_description,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          ]
        : []),
    ] satisfies Prisma.studio_account_secretsWhereInput["AND"];

  export const orderBy = (
    key: IStudioAccountSecret.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "secret.created_at"
      ? { created_at: value }
      : key === "secret.updated_at"
        ? { updated_at: value }
        : key === "secret.key"
          ? { key: value }
          : {
              title: value,
            }) satisfies Prisma.studio_account_secretsOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    input: IStudioAccountSecret.ICreate;
  }): Promise<IStudioAccountSecret> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You must be a member to create a secret.",
      });
    }

    const accountRec = await StudioAccountProvider.find({
      payload: {},
      actor: props.customer,
      target: props.account,
      title: "manager",
    });
    const record = await HubGlobal.prisma.studio_account_secrets.create({
      data: {
        id: v4(),
        account: {
          connect: { id: accountRec.id },
        },
        customer: {
          connect: { id: props.customer.id },
        },
        member: {
          connect: {
            id: props.customer.member.id,
          },
        },
        key: props.input.key,
        values: props.input.values.length
          ? {
              create: props.input.values.map((v, i) =>
                StudioAccountSecretValueProvider.collect({
                  customer: props.customer,
                  input: v,
                  sequence: i,
                }),
              ),
            }
          : undefined,
        title: props.input.title,
        description: props.input.description,
        created_at: new Date(),
        updated_at: new Date(),
      },
      ...json.select(),
    });
    return json.transform(record);
  };

  export const emplace = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    input: IStudioAccountSecret.ICreate;
  }): Promise<IStudioAccountSecret> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You must be a member to create a secret.",
      });
    }

    const accountRec = await StudioAccountProvider.find({
      payload: {},
      actor: props.customer,
      target: props.account,
      title: "manager",
    });
    const record = await HubGlobal.prisma.studio_account_secrets.upsert({
      where: {
        studio_account_id_key: {
          studio_account_id: accountRec.id,
          key: props.input.key,
        },
      },
      create: {
        id: v4(),
        account: {
          connect: { id: accountRec.id },
        },
        customer: {
          connect: { id: props.customer.id },
        },
        member: {
          connect: {
            id: props.customer.member.id,
          },
        },
        key: props.input.key,
        title: props.input.title,
        description: props.input.description,
        created_at: new Date(),
        updated_at: new Date(),
      },
      update: {
        title: props.input.title,
        description: props.input.description,
        updated_at: new Date(),
      },
    });

    const sequence: number =
      ((
        await HubGlobal.prisma.studio_account_secret_values.findFirst({
          where: {
            studio_account_secret_id: record.id,
          },
          select: {
            sequence: true,
          },
          orderBy: {
            sequence: "desc",
          },
        })
      )?.sequence ?? -1) + 1;
    await ArrayUtil.asyncMap(props.input.values)(async (v, i) => {
      const value = await HubGlobal.prisma.studio_account_secret_values.upsert({
        where: {
          studio_account_secret_id_code: {
            studio_account_secret_id: record.id,
            code: v.code,
          },
        },
        create: {
          ...StudioAccountSecretValueProvider.collect({
            customer: props.customer,
            input: v,
            sequence: i + sequence + 1,
          }),
          secret: {
            connect: { id: record.id },
          },
        },
        update: {
          value: StudioAccountSecretValueProvider.encrypt(v.value),
          updated_at: new Date(),
          expired_at: v.expired_at ? new Date(v.expired_at) : null,
        },
      });
      await StudioAccountSecretValueScopeProvider.emplace({
        value,
        scopes: v.scopes,
      });
    });
    return json.transform(
      await HubGlobal.prisma.studio_account_secrets.findFirstOrThrow({
        where: { id: record.id },
        ...json.select(),
      }),
    );
  };

  export const update = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    id: string;
    input: IStudioAccountSecret.IUpdate;
  }): Promise<void> => {
    const member = props.customer.member;
    if (member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You must be a member to update a secret.",
      });
    }

    const accountRec = await StudioAccountProvider.find({
      payload: {},
      actor: props.customer,
      target: props.account,
      title: "manager",
    });
    await HubGlobal.prisma.studio_account_secrets.update({
      where: {
        studio_account_id: accountRec.id,
        id: props.id,
      },
      data: {
        title: props.input.title,
        description: props.input.description,
        updated_at: new Date(),
      },
    });
    if (props.input.values !== undefined) {
      await HubGlobal.prisma.studio_account_secret_values.deleteMany({
        where: {
          secret: {
            studio_account_id: accountRec.id,
            id: props.id,
          },
        },
      });
      await HubGlobal.prisma.studio_account_secret_values.createMany({
        data: props.input.values.map((v, i) => ({
          ...StudioAccountSecretValueProvider.collect({
            customer: props.customer,
            input: v,
            sequence: i,
          }),
          ...{
            customer: undefined,
            member: undefined,
          },
          hub_member_id: member.id,
          hub_customer_id: props.customer.id,
          studio_account_secret_id: props.id,
        })),
      });
    }
  };

  export const erase = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    id: string;
  }): Promise<void> => {
    const accountRec = await StudioAccountProvider.find({
      payload: {},
      actor: props.customer,
      target: props.account,
      title: "manager",
    });
    await HubGlobal.prisma.studio_account_secrets.delete({
      where: {
        id: props.id,
        studio_account_id: accountRec.id,
      },
    });
  };
}
