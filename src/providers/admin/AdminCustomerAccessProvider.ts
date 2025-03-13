import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMemberElite } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMemberElite";
import { IHubMemberVillain } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMemberVillain";

import { HubGlobal } from "../../HubGlobal";
import { ErrorProvider } from "../common/ErrorProvider";
import { HubAdministratorProvider } from "../hub/actors/HubAdministratorProvider";
import { HubMemberProvider } from "../hub/actors/HubMemberProvider";

export namespace AdminCustomerAccessProvider {
  export namespace elite {
    export namespace json {
      export const select = () =>
        ({
          include: {
            member: HubMemberProvider.json.select(),
            customer: HubAdministratorProvider.invert.select(),
          },
        }) satisfies Prisma.hub_member_elitesFindManyArgs;

      export const transform = (
        input: Prisma.hub_member_elitesGetPayload<ReturnType<typeof select>>,
      ): IHubMemberElite => {
        return {
          id: input.id,
          type: "elite",
          member: HubMemberProvider.invert.transform(input.member),
          administrator: HubAdministratorProvider.invert.transform(
            input.customer,
          ),
          reason: input.reason ? input.reason : null,
          created_at: input.created_at.toISOString(),
          deleted_at: input.deleted_at ? input.deleted_at.toISOString() : null,
        };
      };
    }

    export const create = async (props: {
      actor: IHubCustomer;
      input: IHubMemberElite.ICreate;
    }): Promise<IHubMemberElite> => {
      if (props.actor.member === null) {
        throw ErrorProvider.forbidden({
          code: HubActorErrorCode.NOT_MEMBER,
          message: "Not joined member.",
        });
      }

      if (props.actor.member.administrator === null) {
        throw ErrorProvider.forbidden({
          code: HubActorErrorCode.NOT_ADMINISTRATOR,
          message: "Not administrator.",
        });
      }

      const member = await HubGlobal.prisma.hub_members.findFirst({
        where: {
          id: props.input.member_id,
        },
      });

      if (member === null) {
        throw ErrorProvider.notFound({
          code: HubActorErrorCode.NOT_MEMBER,
          message: "You're not a member.",
        });
      }

      const diagnoses: IDiagnosis[] = [];
      const inspect = (closure: () => IDiagnosis, count: number) => {
        if (count !== 0) diagnoses.push(closure());
      };
      inspect(
        () => ({
          accessor: "input.member_id",
          code: HubActorErrorCode.ALREADY_ELITE_MEMBER,
          message: "Already elite Member",
        }),
        await HubGlobal.prisma.hub_member_elites.count({
          where: {
            hub_channel_id: props.actor.channel.id,
            hub_member_id: props.input.member_id,
          },
        }),
      );

      if (diagnoses.length !== 0) throw ErrorProvider.conflict(diagnoses);

      const record = await HubGlobal.prisma.hub_member_elites.create({
        data: collect(props),
        ...json.select(),
      });
      return json.transform(record);
    };

    const collect = (props: {
      actor: IHubCustomer;
      input: IHubMemberElite.ICreate;
    }) =>
      ({
        id: v4(),
        member: {
          connect: {
            id: props.input.member_id,
          },
        },
        customer: {
          connect: {
            id: props.actor.id,
          },
        },
        reason: props.input.reason,
        channel: {
          connect: {
            id: props.actor.channel.id,
          },
        },
        created_at: new Date(),
      }) satisfies Prisma.hub_member_elitesCreateInput;

    export const erase = async (props: {
      actor: IHubCustomer;
      id: string;
    }): Promise<void> => {
      if (props.actor.member === null) {
        throw ErrorProvider.forbidden({
          code: HubActorErrorCode.NOT_MEMBER,
          message: "Not joined member.",
        });
      }

      if (props.actor.member.administrator === null) {
        throw ErrorProvider.forbidden({
          code: HubActorErrorCode.NOT_ADMINISTRATOR,
          message: "Not administrator.",
        });
      }

      const member = await HubGlobal.prisma.hub_members.findFirst({
        where: {
          id: props.id,
        },
      });

      if (member === null) {
        throw ErrorProvider.badRequest({
          code: HubActorErrorCode.NOT_MEMBER,
          message: "You're not a member.",
        });
      }

      await HubGlobal.prisma.hub_member_elites.update({
        where: {
          id: props.id,
        },
        data: {
          deleted_at: new Date().toISOString(),
        },
      });
    };
  }

  export namespace villain {
    export namespace json {
      export const select = () =>
        ({
          include: {
            member: HubMemberProvider.json.select(),
            customer: HubAdministratorProvider.invert.select(),
          },
        }) satisfies Prisma.hub_member_elitesFindManyArgs;

      export const transform = (
        input: Prisma.hub_member_villainsGetPayload<ReturnType<typeof select>>,
      ): IHubMemberVillain => {
        return {
          id: input.id,
          type: "villain",
          member: HubMemberProvider.invert.transform(input.member),
          administrator: HubAdministratorProvider.invert.transform(
            input.customer,
          ),
          reason: input.reason ?? null,
          created_at: input.created_at.toISOString(),
          deleted_at: input.deleted_at ? input.deleted_at.toISOString() : null,
        };
      };
    }

    export const create = async (props: {
      actor: IHubCustomer;
      input: IHubMemberVillain.ICreate;
    }): Promise<IHubMemberVillain> => {
      if (props.actor.member === null) {
        throw ErrorProvider.forbidden({
          code: HubActorErrorCode.NOT_MEMBER,
          message: "Not joined member.",
        });
      }

      if (props.actor.member.administrator === null) {
        throw ErrorProvider.forbidden({
          code: HubActorErrorCode.NOT_ADMINISTRATOR,
          message: "Not administrator.",
        });
      }

      const member = await HubGlobal.prisma.hub_members.findFirst({
        where: {
          id: props.input.member_id,
        },
      });

      if (member === null) {
        throw ErrorProvider.notFound({
          code: HubActorErrorCode.NOT_MEMBER,
          message: "You're not a member.",
        });
      }

      const diagnoses: IDiagnosis[] = [];
      const inspect = (closure: () => IDiagnosis, count: number) => {
        if (count !== 0) diagnoses.push(closure());
      };
      inspect(
        () => ({
          accessor: "input.member_id",
          code: HubActorErrorCode.ALREADY_VILLAIN_MEMBER,
          message: "Already villain Member",
        }),
        await HubGlobal.prisma.hub_member_villains.count({
          where: {
            hub_channel_id: props.actor.channel.id,
            hub_member_id: props.input.member_id,
          },
        }),
      );

      if (diagnoses.length !== 0) throw ErrorProvider.conflict(diagnoses);

      const record = await HubGlobal.prisma.hub_member_villains.create({
        data: collect(props),
        ...json.select(),
      });
      return json.transform(record);
    };

    const collect = (props: {
      actor: IHubCustomer;
      input: IHubMemberVillain.ICreate;
    }) =>
      ({
        id: v4(),
        member: {
          connect: {
            id: props.input.member_id,
          },
        },
        customer: {
          connect: {
            id: props.actor.id,
          },
        },
        reason: props.input.reason,
        channel: {
          connect: {
            id: props.actor.channel.id,
          },
        },
        created_at: new Date(),
      }) satisfies Prisma.hub_member_villainsCreateInput;

    export const erase = async (props: {
      actor: IHubCustomer;
      id: string;
    }): Promise<void> => {
      if (props.actor.member === null) {
        throw ErrorProvider.forbidden({
          code: HubActorErrorCode.NOT_MEMBER,
          message: "Not joined member.",
        });
      }

      if (props.actor.member.administrator === null) {
        throw ErrorProvider.forbidden({
          code: HubActorErrorCode.NOT_ADMINISTRATOR,
          message: "Not administrator.",
        });
      }

      const member = await HubGlobal.prisma.hub_members.findFirst({
        where: {
          id: props.id,
        },
      });

      if (member === null) {
        throw ErrorProvider.badRequest({
          code: HubActorErrorCode.NOT_MEMBER,
          message: "You're not a member.",
        });
      }

      await HubGlobal.prisma.hub_member_villains.update({
        where: {
          id: props.id,
        },
        data: {
          deleted_at: new Date().toISOString(),
        },
      });
    };
  }
}
