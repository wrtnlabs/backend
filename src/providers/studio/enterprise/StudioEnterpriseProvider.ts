import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { StudioAccountErrorCode } from "@wrtnlabs/os-api/lib/constants/studio/StudioAccountErrorCode";
import { StudioEnterpriseEmployeeErrorCode } from "@wrtnlabs/os-api/lib/constants/studio/StudioEnterpriseEmployeeErrorCode";
import { StudioEnterpriseEmployeeDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/studio/enterprise/StudioEnterpriseEmployeeDiagnoser";
import { ICodeEntity } from "@wrtnlabs/os-api/lib/structures/common/ICodeEntity";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { StudioAccountProvider } from "../accounts/StudioAccountProvider";
import { StudioEnterpriseEmployeeProvider } from "./StudioEnterpriseEmployeeProvider";
import { StudioEnterpriseTeamProvider } from "./StudioEnterpriseTeamProvider";

export namespace StudioEnterpriseProvider {
  export namespace json {
    export const select = () =>
      ({
        include: {
          account: true,
          teams: StudioEnterpriseTeamProvider.summary.select(),
          employees: StudioEnterpriseEmployeeProvider.json.select(),
        },
      }) satisfies Prisma.studio_enterprisesFindManyArgs;

    export const transform = (
      input: Prisma.studio_enterprisesGetPayload<ReturnType<typeof select>>,
    ): IStudioEnterprise => {
      if (input.account === null)
        throw ErrorProvider.internal({
          code: CommonErrorCode.INTERNAL_SERVER_ERROR,
          message: `Studio Enterprise Account is null`,
        });

      return {
        id: input.id,
        type: "enterprise",
        account: StudioAccountProvider.invert.transform(input.account),
        teams: input.teams.map(StudioEnterpriseTeamProvider.summary.transform),
        name: input.name,
        created_at: input.created_at.toISOString(),
      };
    };
  }

  export namespace summary {
    export const select = () =>
      ({
        include: {
          account: true,
        },
      }) satisfies Prisma.studio_enterprisesFindManyArgs;

    export const transform = (
      input: Prisma.studio_enterprisesGetPayload<ReturnType<typeof select>>,
    ): IStudioEnterprise.ISummary => {
      if (input.account === null)
        throw ErrorProvider.internal({
          code: CommonErrorCode.INTERNAL_SERVER_ERROR,
          message: `Studio Enterprise Account is null`,
        });

      return {
        id: input.id,
        type: "enterprise",
        account: StudioAccountProvider.invert.transform(input.account),
        name: input.name,
        created_at: input.created_at.toISOString(),
      };
    };
  }

  export namespace invertFromAccount {
    export const transform = (
      input: Prisma.studio_enterprisesGetPayload<
        ReturnType<typeof json.select>
      >,
    ): IStudioEnterprise.IInvertFromAccount => ({
      id: input.id,
      type: "enterprise",
      name: input.name,
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({
        include: {
          account: true,
        },
      }) satisfies Prisma.studio_enterprisesFindManyArgs;
  }

  //---------------------------------------------------------------------------
  // READER
  //---------------------------------------------------------------------------
  export const index = (
    input: IStudioEnterprise.IRequest,
  ): Promise<IPage<IStudioEnterprise.ISummary>> => {
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.studio_enterprises,
      transform: summary.transform,
      payload: summary.select(),
    })({
      where: {
        deleted_at: null,
        AND: [...search(input?.search)],
      },
      orderBy: input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(input.sort)
        : [{ created_at: "desc" }],
    })(input);
  };

  const search = (input: IStudioEnterprise.IRequest.ISearch | undefined) =>
    [
      ...(input?.account !== undefined
        ? [
            {
              account: {
                code: {
                  contains: input.account,
                },
              },
            },
          ]
        : []),
      ...(input?.name !== undefined
        ? [
            {
              name: {
                contains: input.name,
              },
            },
          ]
        : []),
    ] satisfies Prisma.studio_enterprisesWhereInput["AND"];

  const orderBy = (
    key: IStudioEnterprise.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    (key === "enterprise.name"
      ? {
          name: direction,
        }
      : key === "enterprise.created_at"
        ? {
            created_at: direction,
          }
        : key === "account.code"
          ? {
              account: {
                code: direction,
              },
            }
          : {}) satisfies Prisma.studio_enterprisesOrderByWithRelationInput;

  export const at = async (id: string): Promise<IStudioEnterprise> => {
    const record = await HubGlobal.prisma.studio_enterprises.findFirstOrThrow({
      where: {
        id: id,
        deleted_at: null,
      },
      ...json.select(),
    });
    return json.transform(record);
  };

  export const get = async (code: string): Promise<IStudioEnterprise> => {
    const record = await HubGlobal.prisma.studio_enterprises.findFirstOrThrow({
      where: {
        account: {
          code,
        },
        deleted_at: null,
      },
      ...json.select(),
    });
    return json.transform(record);
  };

  //---------------------------------------------------------------------------
  // WRITER
  //---------------------------------------------------------------------------
  export const create = async (props: {
    customer: IHubCustomer;
    input: IStudioEnterprise.ICreate;
  }): Promise<IStudioEnterprise> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        accessor: "customer.member",
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You are not a member",
      });
    }

    if (props.input.migrate === false) {
      const enterprise = await HubGlobal.prisma.studio_enterprises.create({
        data: {
          ...collect(props),
          account: {
            create: await StudioAccountProvider.withOutMemberCollect({
              channel: props.customer.channel,
              input: {
                code: props.input.account,
              },
            }),
          },
        },
        ...json.select(),
      });
      await HubGlobal.prisma.studio_enterprise_employees.create({
        data: {
          ...StudioEnterpriseEmployeeProvider.collect({
            member: props.customer.member,
            customer: props.customer,
            enterprise: { id: enterprise.id },
            input: {
              title: "owner",
              member_id: props.customer.member.id,
            },
          }),
          approved_at: new Date(),
        },
      });
      return json.transform(enterprise);
    } else {
      if (props.customer.member.account === null) {
        throw ErrorProvider.forbidden({
          code: StudioAccountErrorCode.DOES_NOT_HAVE,
          message: "You don't have studio account",
        });
      }

      const account = await StudioAccountProvider.get({
        actor: props.customer,
        code: props.customer.member.account.code,
      });
      const enterprise = await HubGlobal.prisma.studio_enterprises.create({
        data: {
          ...collect(props),
          account: {
            connect: {
              id: account.id,
            },
          },
        },
        ...json.select(),
      });

      await HubGlobal.prisma.studio_accounts.update({
        where: {
          id: account.id,
        },
        data: {
          member: {
            disconnect: true,
          },
        },
      });
      if (props.input.new_account_for_customer !== null) {
        await HubGlobal.prisma.studio_accounts.create({
          data: await StudioAccountProvider.collect({
            customer: props.customer,
            input: {
              code: props.input.new_account_for_customer,
            },
          }),
        });
      }

      await HubGlobal.prisma.studio_enterprise_employees.create({
        data: {
          ...StudioEnterpriseEmployeeProvider.collect({
            member: props.customer.member,
            customer: props.customer,
            enterprise: { id: enterprise.id },
            input: {
              title: "owner",
              member_id: props.customer.member.id,
            },
          }),
          approved_at: new Date(),
        },
      });
      return json.transform(enterprise);
    }
  };

  const collect = (props: {
    customer: IHubCustomer;
    input: IStudioEnterprise.ICreate;
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
      name: props.input.name,
      customer: {
        connect: {
          id: props.customer.id,
        },
      },
      member: {
        connect: {
          id: props.customer.member.id,
        },
      },
      channel: {
        connect: {
          id: props.customer.channel.id,
        },
      },
      created_at: new Date(),
      updated_at: new Date(),
    } satisfies Prisma.studio_enterprisesCreateWithoutAccountInput;
  };

  export const update = async (props: {
    customer: IHubCustomer;
    id: string;
    input: IStudioEnterprise.IUpdate;
  }): Promise<void> => {
    const record = await find({
      payload: {},
      actor: props.customer,
      target: { id: props.id },
      title: "observer",
    });
    await HubGlobal.prisma.studio_enterprises.update({
      where: {
        id: record.id,
      },
      data: {
        name: props.input.name,
        updated_at: new Date().toISOString(),
      },
    });
  };

  export const erase = async (props: {
    customer: IHubCustomer;
    id: string;
  }): Promise<void> => {
    const record = await find({
      payload: {},
      actor: props.customer,
      target: { id: props.id },
      title: "observer",
    });
    await HubGlobal.prisma.studio_enterprises.update({
      where: {
        id: record.id,
      },
      data: {
        deleted_at: new Date(),
        account: {
          update: {
            deleted_at: new Date(),
          },
        },
      },
    });
  };

  export const find = async <
    Payload extends Prisma.studio_enterprisesFindManyArgs,
  >(props: {
    payload: Payload;
    actor: IHubActorEntity;
    target: IEntity | ICodeEntity;
    title: IStudioEnterpriseEmployee.Title;
  }): Promise<Prisma.studio_enterprisesGetPayload<Payload>> => {
    if (props.actor.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not Joined Member.",
      });
    }

    const enterprise =
      await HubGlobal.prisma.studio_enterprises.findFirstOrThrow({
        ...props.payload,
        where: {
          ...props.payload.where,
          ...("id" in props.target
            ? typia.misc.assertClone<IEntity>(props.target)
            : {
                account: {
                  ...typia.misc.assertClone<ICodeEntity>(props.target),
                },
              }),
        },
      });

    const out = () =>
      enterprise as Prisma.studio_enterprisesGetPayload<Payload>;

    // CHECK MEMBER PERMISSION
    if (props.actor.type === "administrator" && props.actor.member !== null) {
      return out();
    }

    const mEmployee =
      await HubGlobal.prisma.studio_enterprise_employees.findFirst({
        where: {
          studio_enterprise_id: enterprise.id,
          deleted_at: null,
          OR: [
            {
              hub_member_id: props.actor.member.id,
            },
            {
              companions: {
                some: {
                  employee: {
                    hub_member_id: props.actor.member.id,
                  },
                },
              },
            },
          ],
        },
      });

    if (mEmployee !== null) {
      if (mEmployee.approved_at === null) {
        throw ErrorProvider.forbidden({
          code: StudioEnterpriseEmployeeErrorCode.NOT_APPROVED,
          message: "You've not approved the invitation yet.",
        });
      }
    }

    // 직원의 권한의 위계 관계를 검사.
    if (
      mEmployee !== null &&
      StudioEnterpriseEmployeeDiagnoser.accessible({
        actual: typia.assert<IStudioEnterpriseEmployee.Title>(mEmployee.title),
        target: props.title,
      })
    ) {
      return out();
    }

    const access = await HubGlobal.prisma.studio_enterprise_employees.findFirst(
      {
        where: {
          studio_enterprise_id: enterprise.id,
          deleted_at: null,
          OR: [
            {
              hub_member_id: props.actor.member.id,
            },
            {
              companions: {
                some: {
                  employee: {
                    hub_member_id: props.actor.member.id,
                  },
                },
              },
            },
          ],
        },
      },
    );

    if (access === null) {
      throw ErrorProvider.forbidden({
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: `You don't have permission1`,
      });
    } else if (
      access.title &&
      StudioEnterpriseEmployeeDiagnoser.accessible({
        actual: typia.assert<IStudioEnterpriseEmployee.Title>(access.title),
        target: props.title,
      }) === false
    ) {
      throw ErrorProvider.forbidden({
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "You don't have permission2",
      });
    }

    return enterprise as Prisma.studio_enterprisesGetPayload<Payload>;
  };
}
