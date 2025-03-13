import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { StudioEnterpriseTeamErrorCode } from "@wrtnlabs/os-api/lib/constants/studio/StudioEnterpriseTeamErrorCode";
import { StudioEnterpriseTeamCompanionDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/studio/enterprise/StudioEnterpriseTeamCompanionDiagnoser";
import { ICodeEntity } from "@wrtnlabs/os-api/lib/structures/common/ICodeEntity";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioEnterpriseTeam } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeam";
import { IStudioEnterpriseTeamCompanion } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeamCompanion";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { EntityMergeProvider } from "../../common/EntityMergeProvider";
import { ErrorProvider } from "../../common/ErrorProvider";
import { StudioEnterpriseEmployeeProvider } from "./StudioEnterpriseEmployeeProvider";
import { StudioEnterpriseProvider } from "./StudioEnterpriseProvider";

export namespace StudioEnterpriseTeamProvider {
  export namespace invert {
    export const transform = (
      input: Prisma.studio_enterprise_teamsGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioEnterpriseTeam.IInvert => ({
      ...summary.transform(input),
      enterprise: StudioEnterpriseProvider.summary.transform(input.enterprise),
    });
    export const select = () =>
      ({
        include: {
          enterprise: StudioEnterpriseProvider.summary.select(),
        },
      }) satisfies Prisma.studio_enterprise_teamsFindManyArgs;
  }
  export namespace summary {
    export const transform = (
      input: Prisma.studio_enterprise_teamsGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioEnterpriseTeam.ISummary => ({
      id: input.id,
      type: "team",
      code: input.code,
      name: input.name,
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({}) satisfies Prisma.studio_enterprise_teamsFindManyArgs;
  }

  export namespace json {
    export const select = () =>
      ({}) satisfies Prisma.studio_enterprise_teamsFindManyArgs;

    export const transform = (
      input: Prisma.studio_enterprise_teamsGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioEnterpriseTeam => ({
      id: input.id,
      type: "team",
      code: input.code,
      name: input.name,
      created_at: input.created_at.toISOString(),
    });
  }

  export const index = async (props: {
    actor: IHubActorEntity;
    account: ICodeEntity;
    input: IStudioEnterpriseTeam.IRequest;
  }): Promise<IPage<IStudioEnterpriseTeam.ISummary>> => {
    const enterprise = await StudioEnterpriseProvider.find({
      payload: {},
      actor: props.actor,
      target: props.account,
      title: "member",
    });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.studio_enterprise_teams,
      payload: summary.select(),
      transform: summary.transform,
    })({
      where: {
        AND: [
          {
            enterprise: {
              id: enterprise.id,
            },
            deleted_at: null,
          },
          ...(await search(props.input.search)),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    })(props.input);
  };

  const search = async (
    input: IStudioEnterpriseTeam.IRequest.ISearch | undefined,
  ) =>
    [
      ...(input?.code
        ? [
            {
              code: {
                contains: input.code,
              },
            },
          ]
        : []),
      ...(input?.name
        ? [
            {
              name: {
                contains: input.name,
              },
            },
          ]
        : []),
    ] satisfies Prisma.studio_enterprise_teamsWhereInput["AND"];

  const orderBy = (
    key: IStudioEnterpriseTeam.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    (key === "team.code"
      ? {
          code: direction,
        }
      : key === "team.name"
        ? {
            name: direction,
          }
        : key === "team.created_at"
          ? {
              created_at: direction,
            }
          : {}) satisfies Prisma.studio_enterprise_teamsOrderByWithRelationInput;

  export const at = async (props: {
    actor: IHubActorEntity;
    account: ICodeEntity;
    id: string;
  }): Promise<IStudioEnterpriseTeam> => {
    const enterprise = await StudioEnterpriseProvider.find({
      payload: {},
      actor: props.actor,
      target: props.account,
      title: "member",
    });
    const record =
      await HubGlobal.prisma.studio_enterprise_teams.findFirstOrThrow({
        where: {
          id: props.id,
          enterprise: {
            id: enterprise.id,
          },
          deleted_at: null,
        },
        ...json.select(),
      });
    return json.transform(record);
  };

  export const get = async (props: {
    actor: IHubActorEntity;
    account: ICodeEntity;
    code: string;
  }): Promise<IStudioEnterpriseTeam> => {
    const enterprise = await StudioEnterpriseProvider.find({
      payload: {},
      actor: props.actor,
      target: props.account,
      title: "manager",
    });
    const record =
      await HubGlobal.prisma.studio_enterprise_teams.findFirstOrThrow({
        where: {
          code: props.code,
          enterprise: {
            id: enterprise.id,
          },
        },
        ...json.select(),
      });

    return json.transform(record);
  };

  export const create = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    input: IStudioEnterpriseTeam.ICreate;
  }): Promise<IStudioEnterpriseTeam> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not Joined Member.",
      });
    }

    const enterprise = await StudioEnterpriseProvider.find({
      payload: {
        include: {
          employees: StudioEnterpriseEmployeeProvider.json.select(),
        },
      },
      actor: props.customer,
      target: props.account,
      title: "manager",
    });
    const record = await HubGlobal.prisma.studio_enterprise_teams.create({
      data: collect({
        enterprise: enterprise,
        customer: props.customer,
        member: props.customer.member,
        input: props.input,
      }),
    });
    return json.transform(record);
  };

  export const update = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    id: string;
    input: IStudioEnterpriseTeam.IUpdate;
  }): Promise<void> => {
    const enterprise = await StudioEnterpriseProvider.find({
      payload: {
        include: {
          employees: StudioEnterpriseEmployeeProvider.json.select(),
        },
      },
      actor: props.customer,
      target: props.account,
      title: "manager",
    });
    const record =
      await HubGlobal.prisma.studio_enterprise_teams.findFirstOrThrow({
        where: {
          id: props.id,
          enterprise: {
            id: enterprise.id,
          },
        },
      });
    await HubGlobal.prisma.studio_enterprise_teams.update({
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
    account: ICodeEntity;
    id: string;
  }): Promise<void> => {
    const enterprise = await StudioEnterpriseProvider.find({
      payload: {
        include: {
          employees: StudioEnterpriseEmployeeProvider.json.select(),
        },
      },
      actor: props.customer,
      target: props.account,
      title: "manager",
    });
    const team =
      await HubGlobal.prisma.studio_enterprise_teams.findFirstOrThrow({
        where: {
          id: props.id,
          enterprise: {
            id: enterprise.id,
          },
          deleted_at: null,
        },
      });
    await HubGlobal.prisma.studio_enterprise_teams.update({
      where: {
        id: team.id,
      },
      data: {
        deleted_at: new Date().toISOString(),
      },
    });
  };

  export const merge = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    input: IStudioEnterpriseTeam.IMerge;
  }): Promise<void> => {
    await StudioEnterpriseProvider.find({
      payload: {
        include: {
          employees: StudioEnterpriseEmployeeProvider.json.select(),
        },
      },
      actor: props.customer,
      target: props.account,
      title: "manager",
    });
    await EntityMergeProvider.merge(
      HubGlobal.prisma.studio_enterprise_teams.fields.id.modelName,
    )(props.input);
  };

  const collect = (props: {
    customer: IEntity;
    member: IEntity;
    enterprise: IEntity;
    input: IStudioEnterpriseTeam.ICreate;
  }) =>
    ({
      id: v4(),
      enterprise: {
        connect: {
          id: props.enterprise.id,
        },
      },
      customer: {
        connect: {
          id: props.customer.id,
        },
      },
      member: {
        connect: {
          id: props.member.id,
        },
      },
      code: props.input.code,
      name: props.input.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }) satisfies Prisma.studio_enterprise_teamsCreateInput;

  export const find = async <
    Payload extends Prisma.studio_enterprise_teamsFindManyArgs,
  >(props: {
    payload: Payload;
    actor: IHubActorEntity;
    account: ICodeEntity;
    target: IEntity | ICodeEntity;
    role: IStudioEnterpriseTeamCompanion.Role;
  }): Promise<Prisma.studio_enterprise_teamsGetPayload<Payload>> => {
    if (props.actor.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not Joined Member.",
      });
    }
    const enterprise = await StudioEnterpriseProvider.find({
      payload: {},
      actor: props.actor,
      target: props.account,
      title: "observer",
    });
    const team =
      await HubGlobal.prisma.studio_enterprise_teams.findFirstOrThrow({
        ...props.payload,
        where: {
          ...props.payload.where,
          enterprise: {
            id: enterprise.id,
          },
          ...typia.misc.assertClone<IEntity | ICodeEntity>(props.target),
        },
      });

    const out = () => team as Prisma.studio_enterprise_teamsGetPayload<Payload>;
    if (props.actor.type === "administrator" && props.actor.member !== null) {
      return out();
    }

    const mCompanion =
      await HubGlobal.prisma.studio_enterprise_team_companions.findFirst({
        where: {
          studio_enterprise_team_id: team.id,
          employee: {
            hub_member_id: props.actor.member.id,
          },
        },
      });
    if (
      mCompanion !== null &&
      StudioEnterpriseTeamCompanionDiagnoser.accessible({
        actual: typia.assert<IStudioEnterpriseTeamCompanion.Role>(
          mCompanion.role,
        ),
        target: props.role,
      })
    ) {
      return out();
    }

    const access =
      await HubGlobal.prisma.studio_enterprise_team_companions.findMany({
        where: {
          id: team.id,
          studio_enterprise_team_id: team.id,
          deleted_at: null,
          employee: {
            hub_member_id: props.actor.member.id,
          },
        },
      });
    const best =
      access.sort((a, b) =>
        StudioEnterpriseTeamCompanionDiagnoser.compare(
          typia.assert<IStudioEnterpriseTeamCompanion.Role>(a.role),
          typia.assert<IStudioEnterpriseTeamCompanion.Role>(b.role),
        ),
      )[0] ?? null;
    if (best === null) {
      throw ErrorProvider.forbidden({
        code: StudioEnterpriseTeamErrorCode.INSUFFICIENT_ROLE,
        message: "You don't have permission to access1",
      });
    } else if (
      best.role &&
      StudioEnterpriseTeamCompanionDiagnoser.accessible({
        actual: typia.assert<IStudioEnterpriseTeamCompanion.Role>(best.role),
        target: props.role,
      }) === false
    ) {
      throw ErrorProvider.forbidden({
        code: StudioEnterpriseTeamErrorCode.INSUFFICIENT_ROLE,
        message: "You don't have permission to access2",
      });
    }
    return team as Prisma.studio_enterprise_teamsGetPayload<Payload>;
  };
}
