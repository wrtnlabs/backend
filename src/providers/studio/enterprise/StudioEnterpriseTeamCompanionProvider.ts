import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { ICodeEntity } from "@wrtnlabs/os-api/lib/structures/common/ICodeEntity";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";
import { IStudioEnterpriseTeamCompanion } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeamCompanion";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { StudioEnterpriseEmployeeProvider } from "./StudioEnterpriseEmployeeProvider";
import { StudioEnterpriseProvider } from "./StudioEnterpriseProvider";
import { StudioEnterpriseTeamCompanionAppointmentProvider } from "./StudioEnterpriseTeamCompanionAppointmentProvider";
import { StudioEnterpriseTeamProvider } from "./StudioEnterpriseTeamProvider";

export namespace StudioEnterpriseTeamCompanionProvider {
  export namespace invert {
    export const select = () =>
      ({
        include: {
          team: StudioEnterpriseTeamProvider.summary.select(),
        },
      }) satisfies Prisma.studio_enterprise_team_companionsFindManyArgs;

    export const transform = (
      input: Prisma.studio_enterprise_team_companionsGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioEnterpriseTeamCompanion.IInvert => ({
      id: input.id,
      role: typia.assert<IStudioEnterpriseTeamCompanion.Role>(input.role),
      team: StudioEnterpriseTeamProvider.summary.transform(input.team),
      created_at: input.created_at.toISOString(),
      updated_at: input.updated_at.toISOString(),
    });
  }

  export namespace summary {
    export const select = () =>
      ({
        include: {
          team: StudioEnterpriseTeamProvider.summary.select(),
        },
      }) satisfies Prisma.studio_enterprise_team_companionsFindManyArgs;

    export const transform = (
      input: Prisma.studio_enterprise_team_companionsGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioEnterpriseTeamCompanion.ISummary => ({
      id: input.id,
      role: typia.assert<IStudioEnterpriseTeamCompanion.Role>(input.role),
      created_at: input.created_at.toISOString(),
      updated_at: input.updated_at.toISOString(),
    });
  }

  export namespace json {
    export const select = () =>
      ({
        include: {
          team: StudioEnterpriseTeamProvider.json.select(),
          employee: StudioEnterpriseEmployeeProvider.json.select(),
        },
      }) satisfies Prisma.studio_enterprise_team_companionsFindManyArgs;

    export const transform = (
      input: Prisma.studio_enterprise_team_companionsGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioEnterpriseTeamCompanion => ({
      id: input.id,
      role: typia.assert<IStudioEnterpriseTeamCompanion.Role>(input.role),
      created_at: input.created_at.toISOString(),
      updated_at: input.updated_at.toISOString(),
      employee: StudioEnterpriseEmployeeProvider.json.transform(input.employee),
    });
  }

  export const index = async (props: {
    actor: IHubActorEntity;
    account: ICodeEntity;
    team: ICodeEntity;
    input: IStudioEnterpriseTeamCompanion.IRequest;
  }): Promise<IPage<IStudioEnterpriseTeamCompanion.ISummary>> => {
    const enterprise = await StudioEnterpriseProvider.find({
      payload: {},
      actor: props.actor,
      target: props.account,
      title: "member",
    });
    const team =
      await HubGlobal.prisma.studio_enterprise_teams.findFirstOrThrow({
        where: {
          code: props.team.code,
        },
      });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.studio_enterprise_team_companions,
      payload: summary.select(),
      transform: summary.transform,
    })({
      where: {
        AND: [
          where({
            enterprise,
            team,
          }),
          ...(await search(props.input?.search)),
        ],
      },
      orderBy: props.input?.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    })(props.input);
  };

  const where = (props: { enterprise: IEntity; team: IEntity }) =>
    ({
      team: {
        id: props.team.id,
        enterprise: {
          id: props.enterprise.id,
        },
      },
    }) satisfies Prisma.studio_enterprise_team_companionsWhereInput;

  const search = async (
    input: IStudioEnterpriseTeamCompanion.IRequest.ISearch | undefined,
  ) =>
    [
      ...(input?.roles !== undefined
        ? [
            {
              role: {
                in: input.roles,
              },
            },
          ]
        : []),
      ...(input?.from !== undefined
        ? [
            {
              created_at: {
                gte: input.from,
              },
            },
          ]
        : []),
      ...(input?.to !== undefined
        ? [
            {
              created_at: {
                lte: input.to,
              },
            },
          ]
        : []),
    ] satisfies Prisma.studio_enterprise_team_companionsWhereInput["AND"];

  const orderBy = (
    key: IStudioEnterpriseTeamCompanion.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    (key === "companion.role"
      ? {
          role: direction,
        }
      : key === "companion.created_at"
        ? {
            created_at: direction,
          }
        : {}) satisfies Prisma.studio_enterprise_team_companionsOrderByWithRelationInput;

  export const at = async (props: {
    actor: IHubActorEntity;
    account: ICodeEntity;
    team: ICodeEntity;
    id: string;
  }): Promise<IStudioEnterpriseTeamCompanion> => {
    if (props.actor.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not joined member.",
      });
    }

    const record = await find({
      payload: {
        include: {
          ...json.select().include,
        },
      },
      actor: props.actor,
      account: props.account,
      team: props.team,
      id: props.id,
      role: "observer",
    });
    const companion: IStudioEnterpriseTeamCompanion = json.transform(record);
    if (companion.role === "member" || companion.role === "observer") {
      if (props.actor.member.id !== companion.employee.member.id) {
        throw ErrorProvider.forbidden({
          code: HubActorErrorCode.NOT_MEMBER,
          message: "Not joined member.",
        });
      }
    }
    return json.transform(record);
  };

  export const create = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    team: ICodeEntity;
    input: IStudioEnterpriseTeamCompanion.ICreate;
  }): Promise<IStudioEnterpriseTeamCompanion> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not joined member.",
      });
    }

    const enterprise = await StudioEnterpriseProvider.find({
      payload: {
        include: {
          employees: {
            where: {
              member: {
                id: props.customer.member.id,
              },
            },
            ...StudioEnterpriseEmployeeProvider.json.select(),
          },
        },
      },
      actor: props.customer,
      target: props.account,
      title: "member",
    });
    const title: IStudioEnterpriseEmployee.Title =
      typia.assert<IStudioEnterpriseEmployee.Title>(
        enterprise.employees[0].title,
      );
    if (title === "manager" || title === "owner") {
      const team =
        await HubGlobal.prisma.studio_enterprise_teams.findFirstOrThrow({
          where: {
            code: props.team.code,
          },
        });
      const record =
        await HubGlobal.prisma.studio_enterprise_team_companions.create({
          data: collect({
            team: { id: team.id },
            member: props.customer.member,
            customer: props.customer,
            input: props.input,
          }),
          ...json.select(),
        });
      return json.transform(record);
    } else {
      const team = await StudioEnterpriseTeamProvider.find({
        payload: {},
        actor: props.customer,
        account: props.account,
        target: props.team,
        role:
          props.input.role === "chief" || props.input.role === "manager"
            ? "chief"
            : "manager",
      });
      const record =
        await HubGlobal.prisma.studio_enterprise_team_companions.create({
          data: collect({
            team: { id: team.id },
            member: props.customer.member,
            customer: props.customer,
            input: props.input,
          }),
          ...json.select(),
        });
      return json.transform(record);
    }
  };

  export const update = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    team: ICodeEntity;
    id: string;
    input: IStudioEnterpriseTeamCompanion.IUpdate;
  }): Promise<void> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not joined member.",
      });
    }

    const enterprise = await StudioEnterpriseProvider.find({
      payload: {
        include: {
          employees: {
            where: {
              member: {
                id: props.customer.member.id,
              },
            },
            ...StudioEnterpriseEmployeeProvider.json.select(),
          },
        },
      },
      actor: props.customer,
      target: props.account,
      title: "member",
    });
    if (
      typia.assert<IStudioEnterpriseEmployee.Title>(
        enterprise.employees[0].title,
      ) === "manager" ||
      typia.assert<IStudioEnterpriseEmployee.Title>(
        enterprise.employees[0].title,
      ) === "owner"
    ) {
      const record =
        await HubGlobal.prisma.studio_enterprise_team_companions.findFirstOrThrow(
          {
            where: {
              id: props.id,
            },
          },
        );
      await HubGlobal.prisma.studio_enterprise_team_companions.update({
        where: {
          id: record.id,
        },
        data: {
          role: props.input.role,
          updated_at: new Date().toISOString(),
        },
        ...json.select(),
      });
      await HubGlobal.prisma.studio_enterprise_team_companion_appointments.create(
        {
          data: {
            companion: {
              connect: {
                id: record.id,
              },
            },
            ...StudioEnterpriseTeamCompanionAppointmentProvider.collect({
              member: props.customer.member,
              customer: props.customer,
              role: props.input.role,
            }),
          },
        },
      );
    } else {
      const record = await find({
        payload: {
          include: {
            ...json.select().include,
          },
        },
        actor: props.customer,
        account: props.account,
        team: props.team,
        id: props.id,
        role: "observer",
      });
      const companion = json.transform(record);

      await StudioEnterpriseTeamProvider.find({
        payload: {},
        actor: props.customer,
        account: props.account,
        target: props.team,
        role:
          companion.role === "chief" ||
          companion.role === "manager" ||
          props.input.role === "chief" ||
          props.input.role === "manager"
            ? "chief"
            : "manager",
      });
      await HubGlobal.prisma.studio_enterprise_team_companions.update({
        where: {
          id: record.id,
        },
        data: {
          role: props.input.role,
          updated_at: new Date().toISOString(),
        },
        ...json.select(),
      });
      await HubGlobal.prisma.studio_enterprise_team_companion_appointments.create(
        {
          data: {
            companion: {
              connect: {
                id: record.id,
              },
            },
            ...StudioEnterpriseTeamCompanionAppointmentProvider.collect({
              member: props.customer.member,
              customer: props.customer,
              role: props.input.role,
            }),
          },
        },
      );
    }
  };

  export const erase = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    team: ICodeEntity;
    id: string;
  }): Promise<void> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not joined member.",
      });
    }

    const enterprise = await StudioEnterpriseProvider.find({
      payload: {
        include: {
          employees: {
            where: {
              member: {
                id: props.customer.member.id,
              },
            },
            ...StudioEnterpriseEmployeeProvider.json.select(),
          },
        },
      },
      actor: props.customer,
      target: props.account,
      title: "member",
    });
    if (
      typia.assert<IStudioEnterpriseEmployee.Title>(
        enterprise.employees[0].title,
      ) === "manager" ||
      typia.assert<IStudioEnterpriseEmployee.Title>(
        enterprise.employees[0].title,
      ) === "owner"
    ) {
      const record =
        await HubGlobal.prisma.studio_enterprise_team_companions.findFirstOrThrow(
          {
            where: {
              id: props.id,
            },
          },
        );

      await HubGlobal.prisma.studio_enterprise_team_companions.update({
        where: {
          id: record.id,
        },
        data: {
          deleted_at: new Date(),
        },
      });
    } else {
      const record = await find({
        payload: {
          include: {
            ...json.select().include,
          },
        },
        actor: props.customer,
        account: props.account,
        team: props.team,
        id: props.id,
        role: "observer",
      });
      const companion = json.transform(record);

      await StudioEnterpriseTeamProvider.find({
        payload: {},
        actor: props.customer,
        account: props.account,
        target: props.team,
        role:
          companion.role === "chief" || companion.role === "manager"
            ? "chief"
            : "manager",
      });
      await HubGlobal.prisma.studio_enterprise_team_companions.update({
        where: {
          id: record.id,
        },
        data: {
          deleted_at: new Date(),
        },
      });
    }
  };

  export const collect = (props: {
    team: IEntity;
    member: IEntity;
    customer: IEntity;
    input: IStudioEnterpriseTeamCompanion.ICreate;
  }) =>
    ({
      id: v4(),
      employee: {
        connect: {
          id: props.input.employee_id,
        },
      },
      team: {
        connect: {
          id: props.team.id,
        },
      },
      role: props.input.role,
      appointments: {
        create: StudioEnterpriseTeamCompanionAppointmentProvider.collect({
          member: props.member,
          customer: props.customer,
          role: props.input.role,
        }),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }) satisfies Prisma.studio_enterprise_team_companionsCreateInput;

  export const find = async <
    Payload extends Prisma.studio_enterprise_team_companionsFindFirstArgs,
  >(props: {
    payload: Payload;
    actor: IHubActorEntity;
    account: ICodeEntity;
    team: ICodeEntity | IEntity;
    id: string;
    role: IStudioEnterpriseTeamCompanion.Role;
  }) => {
    const team = await StudioEnterpriseTeamProvider.find({
      payload: {},
      actor: props.actor,
      account: props.account,
      target: props.team,
      role: props.role,
    });
    const record =
      await HubGlobal.prisma.studio_enterprise_team_companions.findFirstOrThrow(
        {
          ...props.payload,
          where: {
            ...props.payload.where,
            id: props.id,
            studio_enterprise_team_id: team.id,
            deleted_at: null,
          },
        },
      );
    return record as Prisma.studio_enterprise_team_companionsGetPayload<Payload>;
  };
}
