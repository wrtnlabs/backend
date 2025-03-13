import { InternalServerErrorException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSaleAuditApproval } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditApproval";

import { HubGlobal } from "../../../../HubGlobal";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubAdministratorProvider } from "../../actors/HubAdministratorProvider";
import { HubSaleAuditProvider } from "./HubSaleAuditProvider";

export namespace HubSaleAuditApprovalProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_audit_approvalsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleAuditApproval => ({
      id: input.id,
      snapshot_id: input.hub_sale_snapshot_id,
      administrator: HubAdministratorProvider.invert.transform(
        input.customer,
        () =>
          new InternalServerErrorException(
            "The approval has not been registered by administrator.",
          ),
      ),
      fee_ratio: input.fee_ratio,
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({
        include: {
          customer: HubAdministratorProvider.invert.select(),
        },
      }) satisfies Prisma.hub_sale_audit_approvalsFindManyArgs;
  }

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    admin: IHubAdministrator.IInvert;
    sale: IEntity;
    audit: IEntity;
    input: IHubSaleAuditApproval.ICreate;
  }): Promise<IHubSaleAuditApproval> => {
    // FIND MATCHED SNAPSHOT
    const material = await HubSaleAuditProvider.isUnapproved({
      actor: props.admin,
      sale: props.sale,
      id: props.audit.id,
    });
    const snapshot =
      props.input.snapshot_id === null
        ? { id: material.last_hub_sale_snapshot_id }
        : await validateSnapshotId({
            sale: props.sale,
            audit: props.audit,
            id: props.input.snapshot_id,
          });

    // ARCHIVE THE APPROVAL RECORD
    const result = await HubGlobal.prisma.hub_sale_audit_approvals.create({
      data: collect({
        ...props,
        snapshot,
      }),
      ...json.select(),
    });

    // UPDATE RELATED RECORDS
    await HubGlobal.prisma.mv_hub_sale_audit_states.update({
      where: {
        hub_sale_audit_id: props.audit.id,
      },
      data: {
        approved_at: new Date().toISOString(),
      },
    });

    await HubGlobal.prisma.mv_hub_sale_last_snapshots.update({
      where: {
        hub_sale_id: props.sale.id,
      },
      data: {
        approved_hub_sale_snapshot_id: material.last_hub_sale_snapshot_id,
        approved_audited_hub_sale_snapshot_id:
          material.last_audited_hub_sale_snapshot_id!,
      },
    });
    const ref = await HubGlobal.prisma.hub_sale_snapshots.update({
      where: {
        id: snapshot.id,
      },
      data: {
        activated_at: new Date(),
      },
      include: {
        units: {
          select: {
            id: true,
            parent_id: true,
          },
        },
      },
    });
    if (ref.units.some((u) => u.parent_id !== null) === true) {
      // MV_ORDER_GOOD_SNAPSHOTS
      const parent =
        await HubGlobal.prisma.hub_sale_snapshot_units.findFirstOrThrow({
          where: {
            id: ref.units.find((u) => u.parent_id !== null)!.parent_id!,
          },
          select: {
            hub_sale_snapshot_id: true,
          },
        });
      await HubGlobal.prisma.$executeRaw`
        INSERT INTO hub.mv_hub_order_good_snapshots
          (
            hub_order_good_id,
            hub_sale_snapshot_id,
            hub_sale_snapshot_origin_id
          )
        SELECT hub_order_good_id,
                UUID(${snapshot.id}),
                hub_sale_snapshot_origin_id
        FROM mv_hub_order_good_snapshots
        WHERE hub_sale_snapshot_id = UUID(${parent.hub_sale_snapshot_id})`;

      // MV_ORDER_GOOD_UNITS
      await HubGlobal.prisma.$executeRaw`
        INSERT INTO hub.mv_hub_order_good_units
          (
            id,
            hub_order_good_id,
            hub_sale_snapshot_id,
            hub_sale_snapshot_unit_id,
            hub_sale_snapshot_unit_origin_id
          )
        SELECT GEN_RANDOM_UUID(),
                MV.hub_order_good_id,
                UUID(${snapshot.id}),
                SSU.id,
                MV.hub_sale_snapshot_unit_origin_id
        FROM hub.mv_hub_order_good_units AS MV
                  INNER JOIN hub.hub_sale_snapshot_units AS SSU
                            ON MV.hub_sale_snapshot_unit_id = SSU.parent_id
        WHERE SSU.hub_sale_snapshot_id = UUID(${snapshot.id})`;
    }
    return json.transform(result);
  };

  const collect = (props: {
    admin: IHubAdministrator.IInvert;
    audit: IEntity;
    snapshot: IEntity;
    input: IHubSaleAuditApproval.ICreate;
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
      snapshot: {
        connect: { id: props.snapshot.id },
      },
      fee_ratio: props.input.fee_ratio,
      created_at: new Date(),
    }) satisfies Prisma.hub_sale_audit_approvalsCreateInput;

  const validateSnapshotId = async (props: {
    sale: IEntity;
    audit: IEntity;
    id: string;
  }): Promise<IEntity> => {
    const snapshot = await HubGlobal.prisma.hub_sale_snapshots.findFirstOrThrow(
      {
        where: {
          id: props.id,
          sale: {
            id: props.sale.id,
          },
        },
      },
    );
    const audit = await HubGlobal.prisma.hub_sale_audits.findFirstOrThrow({
      where: {
        id: props.audit.id,
      },
      include: {
        emendations: true,
      },
    });
    if (
      snapshot.id === audit.hub_sale_snapshot_id ||
      audit.emendations.some(
        (emendation) => emendation.after_hub_sale_snapshot_id === snapshot.id,
      )
    )
      return snapshot;
    throw ErrorProvider.notFound({
      accessor: "input.snapshot_id",
      code: HubSaleErrorCode.SNAPSHOT_NOT_FOUND,
      message: "The snapshot is not related to the audit.",
    });
  };
}
