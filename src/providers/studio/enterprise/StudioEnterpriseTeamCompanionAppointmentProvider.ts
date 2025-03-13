import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IStudioEnterpriseTeamCompanion } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeamCompanion";

export namespace StudioEnterpriseTeamCompanionAppointmentProvider {
  export const collect = (props: {
    customer: IEntity;
    member: IEntity;
    role: IStudioEnterpriseTeamCompanion.Role;
  }) =>
    ({
      id: v4(),
      role: props.role,
      member: {
        connect: {
          id: props.member.id,
        },
      },
      customer: {
        connect: {
          id: props.customer.id,
        },
      },
      created_at: new Date(),
    }) satisfies Prisma.studio_enterprise_team_companion_appointmentsCreateWithoutCompanionInput;
}
