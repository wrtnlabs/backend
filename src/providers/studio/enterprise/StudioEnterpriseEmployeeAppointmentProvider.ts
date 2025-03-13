import { Prisma } from "@prisma/client";
import { IEntity } from "@samchon/payment-api/lib/structures/common/IEntity";
import { v4 } from "uuid";

import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

export namespace StudioEnterpriseEmployeeAppointmentProvider {
  export namespace json {
    export const select = () =>
      ({}) satisfies Prisma.studio_enterprise_employee_appointmentsFindFirstArgs;
  }

  export const collect = (props: {
    member: IEntity;
    customer: IEntity;
    title: IStudioEnterpriseEmployee.Title;
  }) =>
    ({
      id: v4(),
      title: props.title,
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
    }) satisfies Prisma.studio_enterprise_employee_appointmentsCreateWithoutEmployeeInput;
}
