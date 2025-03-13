import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { StudioAccountErrorCode } from "@wrtnlabs/os-api/lib/constants/studio/StudioAccountErrorCode";
import { StudioEnterpriseEmployeeErrorCode } from "@wrtnlabs/os-api/lib/constants/studio/StudioEnterpriseEmployeeErrorCode";
import { StudioEnterpriseEmployeeDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/studio/enterprise/StudioEnterpriseEmployeeDiagnoser";
import { ICodeEntity } from "@wrtnlabs/os-api/lib/structures/common/ICodeEntity";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubMemberProvider } from "../../hub/actors/HubMemberProvider";
import { StudioEnterpriseProvider } from "../enterprise/StudioEnterpriseProvider";

export namespace StudioAccountProvider {
  export namespace json {
    export const select = () =>
      ({
        include: {
          member: HubMemberProvider.json.select(),
          enterprise: StudioEnterpriseProvider.summary.select(),
        },
      }) satisfies Prisma.studio_accountsFindManyArgs;

    export const transform = (
      input: Prisma.studio_accountsGetPayload<ReturnType<typeof select>>,
    ): IStudioAccount.ISummary => {
      if (input.member === null && input.enterprise === null) {
        throw ErrorProvider.internal({
          code: CommonErrorCode.INTERNAL_SERVER_ERROR,
          message: "Member and enterprise null for the studio account",
        });
      }

      const owner =
        input.member !== null
          ? HubMemberProvider.json.transform(input.member)
          : input.enterprise !== null
            ? StudioEnterpriseProvider.summary.transform(input.enterprise)
            : (() => {
                throw ErrorProvider.internal({
                  code: CommonErrorCode.INTERNAL_SERVER_ERROR,
                  message: "Both member and enterprise cannot be null",
                });
              })();

      return {
        id: input.id,
        code: input.code,
        owner: owner,
        created_at: input.created_at.toISOString(),
      };
    };
  }

  export namespace summary {
    export const select = () =>
      ({
        include: {
          member: HubMemberProvider.json.select(),
          enterprise: StudioEnterpriseProvider.summary.select(),
        },
      }) satisfies Prisma.studio_accountsFindManyArgs;

    export const transform = (
      input: Prisma.studio_accountsGetPayload<ReturnType<typeof select>>,
    ): IStudioAccount.ISummary => {
      if (input.member === null && input.enterprise === null) {
        throw ErrorProvider.internal({
          code: CommonErrorCode.INTERNAL_SERVER_ERROR,
          message: "Member and enterprise null for the studio account",
        });
      }

      const owner =
        input.member !== null
          ? HubMemberProvider.json.transform(input.member)
          : input.enterprise !== null
            ? StudioEnterpriseProvider.summary.transform(input.enterprise)
            : (() => {
                throw ErrorProvider.internal({
                  code: CommonErrorCode.INTERNAL_SERVER_ERROR,
                  message: "Both member and enterprise cannot be null",
                });
              })();

      return {
        id: input.id,
        code: input.code,
        owner: owner,
        created_at: input.created_at.toISOString(),
      };
    };
  }

  export namespace invert {
    export const select = () =>
      ({}) satisfies Prisma.studio_accountsFindManyArgs;

    export const transform = (
      input: Prisma.studio_accountsGetPayload<ReturnType<typeof select>>,
    ): IStudioAccount.IInvert => ({
      id: input.id,
      code: input.code,
      created_at: input.created_at.toISOString(),
    });
  }

  //---------------------------------------------------------------------------
  // READER
  //---------------------------------------------------------------------------
  export const find = async <
    Payload extends Prisma.studio_accountsFindManyArgs,
  >(props: {
    payload: Payload;
    actor: IHubActorEntity;
    target: IEntity | ICodeEntity;
    title: IStudioEnterpriseEmployee.Title | null;
  }) => {
    const account = await HubGlobal.prisma.studio_accounts.findFirstOrThrow({
      where: {
        ...(typia.is<IEntity>(props.target)
          ? { id: props.target.id }
          : { code: props.target.code }),

        deleted_at: null,
      },
      ...props.payload,
    });
    if (props.actor.type === "administrator")
      return account as Prisma.studio_accountsGetPayload<Payload>;

    if (props.title !== null)
      if (account.studio_enterprise_id === null) {
        if (account.hub_member_id !== props.actor.member?.id)
          throw ErrorProvider.forbidden({
            code: StudioAccountErrorCode.OWNERSHIP,
            message: "Not Owned Account",
          });
      } else {
        const employee =
          await HubGlobal.prisma.studio_enterprise_employees.findFirstOrThrow({
            where: {
              studio_enterprise_id: account.studio_enterprise_id,
              hub_member_id: props.actor.member?.id,
              title: props.title,
            },
          });
        if (employee === null)
          throw ErrorProvider.forbidden({
            code: StudioEnterpriseEmployeeErrorCode.NOT_A_CLERK,
            message: "Not Owned Account",
          });
        else if (
          false ===
          StudioEnterpriseEmployeeDiagnoser.accessible({
            actual: typia.assert<IStudioEnterpriseEmployee.Title>(
              employee.title,
            ),
            target: "manager",
          })
        )
          throw ErrorProvider.forbidden({
            code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
            message: "Not Owned Account",
          });
      }
    return account as Prisma.studio_accountsGetPayload<Payload>;
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    id: string;
  }): Promise<IStudioAccount> => {
    const record = await find({
      payload: json.select(),
      actor: props.actor,
      target: { id: props.id },
      title: null,
    });
    return json.transform(record);
  };

  export const get = async (props: {
    actor: IHubActorEntity;
    code: string;
  }): Promise<IStudioAccount> => {
    const record = await find({
      payload: json.select(),
      actor: props.actor,
      target: { code: props.code },
      title: null,
    });
    return json.transform(record);
  };

  export const index = async (
    input: IStudioAccount.IRequest,
  ): Promise<IPage<IStudioAccount.ISummary>> =>
    PaginationUtil.paginate({
      schema: HubGlobal.prisma.studio_accounts,
      payload: json.select(),
      transform: summary.transform,
    })({
      where: {
        deleted_at: null,
        AND: [...(await search(input?.search))],
      },
      orderBy: input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.studio_accountsFindManyArgs)(input);

  const search = async (input: IStudioAccount.IRequest.ISearch | undefined) =>
    [
      ...(input?.type !== undefined
        ? input.type === "member"
          ? [
              {
                enterprise: null,
              },
            ]
          : input.type === "enterprise"
            ? [
                {
                  member: null,
                },
              ]
            : []
        : []),
      ...(input?.code !== undefined
        ? [
            {
              code: {
                contains: input.code,
              },
            },
          ]
        : []),
    ] satisfies Prisma.studio_accountsWhereInput["AND"];

  export const orderBy = (
    key: IStudioAccount.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    (key === "account.code"
      ? {
          code: direction,
        }
      : key === "account.created_at"
        ? {
            created_at: direction,
          }
        : {}) satisfies Prisma.studio_accountsOrderByWithRelationInput;

  //---------------------------------------------------------------------------
  // WRITER
  //---------------------------------------------------------------------------

  export const create = async (props: {
    customer: IHubCustomer;
    input: IStudioAccount.ICreate;
  }): Promise<IStudioAccount> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not Joined Member.",
      });
    }

    const diagnoses: IDiagnosis[] = [];
    const inspect = (closure: () => IDiagnosis, count: number) => {
      if (count !== 0) diagnoses.push(closure());
    };
    inspect(
      () => ({
        accessor: "customer.member.id",
        code: StudioAccountErrorCode.HAVE,
        message: "Already Account Member.",
      }),
      await HubGlobal.prisma.studio_accounts.count({
        where: {
          member: {
            id: props.customer.member.id,
          },
        },
      }),
    );
    inspect(
      () => ({
        accessor: "input.code",
        code: StudioAccountErrorCode.DUPLICATED,
        message: "Same account code already exists.",
      }),
      await HubGlobal.prisma.studio_accounts.count({
        where: {
          channel: {
            id: props.customer.channel.id,
          },
          code: props.input.code,
        },
      }),
    );
    if (diagnoses.length !== 0) throw ErrorProvider.conflict(diagnoses);

    const record = await HubGlobal.prisma.studio_accounts.create({
      data: await collect(props),
      ...json.select(),
    });
    return json.transform(record);
  };

  export const collect = async (props: {
    customer: IHubCustomer;
    input: IStudioAccount.ICreate;
    channel?: IEntity;
  }) =>
    ({
      id: v4(),
      channel: {
        connect: {
          id: props.channel?.id ?? props.customer.channel.id,
        },
      },
      member: {
        connect: {
          id: props.customer.member?.id,
        },
      },
      code: props.input.code,
      created_at: new Date(),
    }) satisfies Prisma.studio_accountsCreateInput;

  export const withOutMemberCollect = async (props: {
    channel: IEntity;
    input: IStudioAccount.ICreate;
  }) =>
    ({
      id: v4(),
      channel: {
        connect: {
          id: props.channel.id,
        },
      },
      code: props.input.code,
      created_at: new Date(),
    }) satisfies Prisma.studio_accountsCreateInput;

  export const erase = async (props: {
    customer: IHubCustomer;
    id: string;
  }): Promise<void> => {
    await find({
      payload: {},
      actor: props.customer,
      target: { id: props.id },
      title: "owner",
    });
    await HubGlobal.prisma.studio_accounts.update({
      where: {
        id: props.id,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  };

  // ---------------------------------------------------------------------------
  // UPDATER
  // ---------------------------------------------------------------------------

  export const update = async (props: {
    customer: IHubCustomer;
    id: string;
    input: IStudioAccount.IUpdate;
  }): Promise<void> => {
    await find({
      actor: props.customer,
      target: { id: props.id },
      title: "owner",
      payload: {},
    });
    await HubGlobal.prisma.studio_accounts.update({
      where: {
        id: props.id,
      },
      data: {
        code: props.input.code,
      },
    });
  };
}
