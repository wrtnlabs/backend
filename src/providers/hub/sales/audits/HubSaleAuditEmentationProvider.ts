import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubAdministratorDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/actors/HubAdministratorDiagnoser";
import { HubSellerDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/actors/HubSellerDiagnoser";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleAuditEmendation } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditEmendation";

import { HubGlobal } from "../../../../HubGlobal";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubCustomerProvider } from "../../actors/HubCustomerProvider";
import { HubSaleSnapshotProvider } from "../HubSaleSnapshotProvider";
import { HubSaleAuditProvider } from "./HubSaleAuditProvider";

export namespace HubSaleAuditEmentationProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_audit_emendationsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleAuditEmendation => {
      const customer = HubCustomerProvider.json.transform(input.customer);
      const emender =
        input.actor_type === "administrator"
          ? HubAdministratorDiagnoser.invert(customer)
          : HubSellerDiagnoser.invert(customer);
      if (emender === null)
        throw ErrorProvider.internal({
          code: CommonErrorCode.INTERNAL_SERVER_ERROR,
          message: `The emender has not been registered by ${input.actor_type}.`,
        });
      return {
        id: input.id,
        emender,
        source_snapshot_id: input.previous_hub_sale_snapshot_id,
        emended_snapshot_id: input.after_hub_sale_snapshot_id,
        description: input.description,
        created_at: input.created_at.toISOString(),
      };
    };
    export const select = () =>
      ({
        include: {
          customer: HubCustomerProvider.json.select(),
        },
      }) satisfies Prisma.hub_sale_audit_emendationsFindManyArgs;
  }

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    actor: IHubAdministrator.IInvert | IHubSeller.IInvert;
    sale: IEntity;
    audit: IEntity;
    input: IHubSaleAuditEmendation.ICreate;
  }) => {
    await HubSaleAuditProvider.isUnapproved({
      actor: props.actor,
      sale: props.sale,
      id: props.audit.id,
    });
    const snapshot = await HubGlobal.prisma.hub_sale_snapshots.create({
      data: {
        ...(await HubSaleSnapshotProvider.collect({
          actor: props.actor,
          accessor: "input.data",
          input: props.input.data,
        })),
        sale: {
          connect: {
            id: props.sale.id,
          },
        },
      },
    });
    const record = await HubGlobal.prisma.hub_sale_audit_emendations.create({
      data: {
        id: v4(),
        actor_type: props.actor.type,
        customer: {
          connect: { id: props.actor.customer.id },
        },
        member: {
          connect: {
            id: props.actor.member.id,
          },
        },
        audit: {
          connect: { id: props.audit.id },
        },
        previous: {
          connect: {
            id: props.input.source_snapshot_id,
          },
        },
        after: {
          connect: {
            id: snapshot.id,
          },
        },
        description: props.input.description,
        created_at: new Date(),
      },
      ...json.select(),
    });
    await HubGlobal.prisma.mv_hub_sale_last_snapshots.update({
      where: {
        hub_sale_id: props.sale.id,
      },
      data: {
        lastAudited: {
          connect: {
            id: snapshot.id,
          },
        },
      },
    });
    return json.transform(record);
  };
}
