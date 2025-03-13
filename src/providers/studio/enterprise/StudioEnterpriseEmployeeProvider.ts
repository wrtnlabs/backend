import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { StudioEnterpriseEmployeeErrorCode } from "@wrtnlabs/os-api/lib/constants/studio/StudioEnterpriseEmployeeErrorCode";
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
import { HubMemberProvider } from "../../hub/actors/HubMemberProvider";
import { StudioEnterpriseEmployeeAppointmentProvider } from "./StudioEnterpriseEmployeeAppointmentProvider";
import { StudioEnterpriseProvider } from "./StudioEnterpriseProvider";
import { StudioEnterpriseTeamCompanionProvider } from "./StudioEnterpriseTeamCompanionProvider";

export namespace StudioEnterpriseEmployeeProvider {
  export namespace json {
    export const select = () =>
      ({
        include: {
          member: HubMemberProvider.json.select(),
          companions: StudioEnterpriseTeamCompanionProvider.invert.select(),
        },
      }) satisfies Prisma.studio_enterprise_employeesFindManyArgs;

    export const transform = (
      input: Prisma.studio_enterprise_employeesGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioEnterpriseEmployee => {
      return {
        id: input.id,
        type: "employee",
        member: HubMemberProvider.json.transform(input.member),
        title: typia.assert<IStudioEnterpriseEmployee.Title>(input.title),
        created_at: input.created_at.toISOString(),
        updated_at: input.updated_at.toISOString(),
        approved_at: input.approved_at?.toISOString() ?? null,
        teams: input.companions.map(
          StudioEnterpriseTeamCompanionProvider.invert.transform,
        ),
      };
    };
  }

  export namespace summary {
    export const select = () =>
      ({
        include: {
          member: HubMemberProvider.json.select(),
          companions: StudioEnterpriseTeamCompanionProvider.invert.select(),
        },
      }) satisfies Prisma.studio_enterprise_employeesFindManyArgs;

    export const transform = (
      input: Prisma.studio_enterprise_employeesGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioEnterpriseEmployee.ISummary => {
      return {
        id: input.id,
        type: "employee",
        member: HubMemberProvider.json.transform(input.member),
        title: typia.assert<IStudioEnterpriseEmployee.Title>(input.title),
        created_at: input.created_at.toISOString(),
        updated_at: input.updated_at.toISOString(),
        approved_at: input.approved_at?.toISOString() ?? null,
      };
    };
  }

  export const index = async (props: {
    actor: IHubActorEntity;
    account: ICodeEntity;
    input: IStudioEnterpriseEmployee.IRequest;
  }): Promise<IPage<IStudioEnterpriseEmployee.ISummary>> => {
    await StudioEnterpriseProvider.find({
      payload: {},
      actor: props.actor,
      target: props.account,
      title: "observer",
    });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.studio_enterprise_employees,
      payload: summary.select(),
      transform: summary.transform,
    })({
      where: {
        AND: [
          where({ code: props.account.code }),
          ...(await search(props.input?.search)),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    })(props.input);
  };

  const where = (accountCode: ICodeEntity) =>
    ({
      enterprise: {
        account: {
          code: accountCode.code,
        },
      },
      deleted_at: null,
    }) satisfies Prisma.studio_enterprise_employeesWhereInput["AND"];

  const search = async (
    input: IStudioEnterpriseEmployee.IRequest.ISearch | undefined,
  ) =>
    [
      ...(input?.title !== undefined
        ? [
            {
              title: input.title,
            },
          ]
        : []),
      ...(input?.approved !== undefined
        ? [
            {
              approved_at: input.approved
                ? {
                    not: null,
                  }
                : null,
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
    ] satisfies Prisma.studio_enterprise_employeesWhereInput["AND"];

  const orderBy = (
    key: IStudioEnterpriseEmployee.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    (key === "employee.title"
      ? {
          title: direction,
        }
      : key === "employee.created_at"
        ? {
            created_at: direction,
          }
        : key === "employee.approved_at"
          ? {
              approved_at: direction,
            }
          : {}) satisfies Prisma.studio_enterprise_employeesOrderByWithRelationInput;

  export const at = async (props: {
    actor: IHubActorEntity;
    account: ICodeEntity;
    id: string;
  }): Promise<IStudioEnterpriseEmployee> => {
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
      id: props.id,
      title: "observer",
    });
    const employee: IStudioEnterpriseEmployee = json.transform(record);

    if (employee.title === "member" || employee.title !== "observer") {
      // 찾고자 하는 사람과 회사는 같지만 해당 사람이 아닌 경우
      if (record.hub_member_id !== props.actor.member.id) {
        throw ErrorProvider.forbidden({
          code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
          message:
            "If the person you are looking for and the company are the same, but not the person you are looking for.",
        });
      }
    }
    return employee;
  };

  export const create = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    input: IStudioEnterpriseEmployee.ICreate;
  }): Promise<IStudioEnterpriseEmployee> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not joined member.",
      });
    }

    const enterprise = await StudioEnterpriseProvider.find({
      payload: {},
      actor: props.customer,
      target: props.account,
      title:
        props.input.title === "owner" || props.input.title === "manager"
          ? "owner"
          : "manager",
    });
    const record = await HubGlobal.prisma.studio_enterprise_employees.create({
      data: collect({
        member: props.customer.member,
        customer: props.customer,
        input: props.input,
        enterprise,
      }),
      ...json.select(),
    });
    return json.transform(record);
  };

  export const collect = (props: {
    member: IEntity;
    customer: IEntity;
    enterprise: IEntity;
    input: IStudioEnterpriseEmployee.ICreate;
  }) =>
    ({
      id: v4(),
      title: props.input.title,
      enterprise: {
        connect: {
          id: props.enterprise.id,
        },
      },
      member: {
        connect: {
          id: props.input.member_id,
        },
      },
      appointments: {
        create: StudioEnterpriseEmployeeAppointmentProvider.collect({
          member: props.member,
          customer: props.customer,
          title: props.input.title,
        }),
      },
      created_at: new Date(),
      updated_at: new Date(),
    }) satisfies Prisma.studio_enterprise_employeesCreateInput;

  export const update = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    id: string;
    input: IStudioEnterpriseEmployee.IUpdate;
  }): Promise<void> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not joined member.",
      });
    }

    // 상대방의 권한 체크
    const record = await find({
      payload: {
        include: {
          ...json.select().include,
        },
      },
      actor: props.customer,
      account: props.account,
      id: props.id,
      title: "observer",
    });
    const employee: IStudioEnterpriseEmployee = json.transform(record);

    // 나의 권한 체크
    await StudioEnterpriseProvider.find({
      payload: {},
      actor: props.customer,
      target: props.account,
      title:
        employee.title === "manager" ||
        employee.title === "owner" ||
        props.input.title === "manager" ||
        props.input.title === "owner"
          ? "owner"
          : "manager",
    });
    await HubGlobal.prisma.studio_enterprise_employees.update({
      where: {
        id: record.id,
      },
      data: {
        title: props.input.title,
        updated_at: new Date(),
      },
    });
    await HubGlobal.prisma.studio_enterprise_employee_appointments.create({
      data: {
        employee: {
          connect: {
            id: employee.id,
          },
        },
        ...StudioEnterpriseEmployeeAppointmentProvider.collect({
          member: props.customer.member,
          customer: props.customer,
          title: props.input.title,
        }),
      },
    });
  };

  export const erase = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    id: string;
  }): Promise<void> => {
    // 상대방의 권한 체크
    const record = await find({
      payload: {
        include: {
          ...json.select().include,
        },
      },
      actor: props.customer,
      account: props.account,
      id: props.id,
      title: "observer",
    });
    const employee: IStudioEnterpriseEmployee = json.transform(record);

    // 나의 권한 체크
    await StudioEnterpriseProvider.find({
      payload: {},
      actor: props.customer,
      target: props.account,
      title:
        employee.title === "manager" || employee.title === "owner"
          ? "owner"
          : "manager",
    });
    await HubGlobal.prisma.studio_enterprise_employees.update({
      where: {
        id: record.id,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  };

  export const approve = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
  }): Promise<IStudioEnterpriseEmployee> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not joined member.",
      });
    }

    const enterprise: IStudioEnterprise = await StudioEnterpriseProvider.get(
      props.account.code,
    );
    const record = await HubGlobal.prisma.studio_enterprise_employees.findFirst(
      {
        where: {
          member: {
            id: props.customer.member.id,
          },
          enterprise: {
            id: enterprise.id,
          },
          deleted_at: null,
        },
      },
    );
    if (record === null) {
      throw ErrorProvider.notFound({
        code: StudioEnterpriseEmployeeErrorCode.NOT_INVITED,
        message: "You are not invited.",
      });
    }

    const update = await HubGlobal.prisma.studio_enterprise_employees.update({
      where: {
        id: record.id,
      },
      data: {
        approved_at: new Date(),
      },
      ...json.select(),
    });
    return json.transform(update);
  };

  export const find = async <
    Payload extends Prisma.studio_enterprise_employeesFindManyArgs,
  >(props: {
    payload: Payload;
    actor: IHubActorEntity;
    account: ICodeEntity | IEntity;
    id: string;
    title: IStudioEnterpriseEmployee.Title;
  }) => {
    const enterprise = await StudioEnterpriseProvider.find({
      payload: {},
      actor: props.actor,
      target: props.account,
      title: props.title,
    });
    const record =
      await HubGlobal.prisma.studio_enterprise_employees.findFirstOrThrow({
        ...props.payload,
        where: {
          ...props.payload.where,
          id: props.id,
          studio_enterprise_id: enterprise.id,
          deleted_at: null,
        },
      });
    return record as Prisma.studio_enterprise_employeesGetPayload<Payload>;
  };
}
