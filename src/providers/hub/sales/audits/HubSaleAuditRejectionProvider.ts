import { InternalServerErrorException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSaleAuditRejection } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditRejection";

import { HubGlobal } from "../../../../HubGlobal";
import { HubAdministratorProvider } from "../../actors/HubAdministratorProvider";
import { HubSaleAuditProvider } from "./HubSaleAuditProvider";

export namespace HubSaleAuditRejectionProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_audit_rejectionsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleAuditRejection => ({
      id: input.id,
      administrator: HubAdministratorProvider.invert.transform(
        input.customer,
        () =>
          new InternalServerErrorException(
            "The rejection has not been registered by administrator.",
          ),
      ),
      reversible: input.reversible,
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({
        include: {
          customer: HubAdministratorProvider.invert.select(),
        },
      }) satisfies Prisma.hub_sale_audit_rejectionsFindManyArgs;
  }

  /* -----------------------------------------------------------
      WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    admin: IHubAdministrator.IInvert;
    sale: IEntity;
    audit: IEntity;
    input: IHubSaleAuditRejection.ICreate;
  }): Promise<IHubSaleAuditRejection> => {
    await HubSaleAuditProvider.isUnapproved({
      actor: props.admin,
      sale: props.sale,
      id: props.audit.id,
    });
    const result = await HubGlobal.prisma.hub_sale_audit_rejections.create({
      data: collect(props),
      ...json.select(),
    });

    // UPDATE RELATED RECORDS
    await HubGlobal.prisma.mv_hub_sale_audit_states.update({
      where: {
        hub_sale_audit_id: props.audit.id,
      },
      data: {
        rejected_at: new Date().toISOString(),
      },
    });
    return json.transform(result);
  };

  const collect = (props: {
    admin: IHubAdministrator.IInvert;
    audit: IEntity;
    input: IHubSaleAuditRejection.ICreate;
  }) =>
    ({
      id: v4(),
      customer: {
        connect: { id: props.admin.customer.id },
      },
      member: {
        connect: {
          id: props.admin.member.id,
        },
      },
      audit: {
        connect: { id: props.audit.id },
      },
      reversible: props.input.reversible,
      created_at: new Date(),
    }) satisfies Prisma.hub_sale_audit_rejectionsCreateInput;
}
