import { InternalServerErrorException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { HubSaleAuditErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleAuditErrorCode";
import { HubSaleAuditDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";

import { HubGlobal } from "../../../../HubGlobal";
import { BbsArticleProvider } from "../../../common/BbsArticleProvider";
import { BbsArticleSnapshotProvider } from "../../../common/BbsArticleSnapshotProvider";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubAdministratorProvider } from "../../actors/HubAdministratorProvider";
import { HubCustomerProvider } from "../../actors/HubCustomerProvider";
import { HubSellerProvider } from "../../actors/HubSellerProvider";
import { HubSaleAuditApprovalProvider } from "./HubSaleAuditApprovalProvider";
import { HubSaleAuditEmentationProvider } from "./HubSaleAuditEmentationProvider";
import { HubSaleAuditRejectionProvider } from "./HubSaleAuditRejectionProvider";

export namespace HubSaleAuditProvider {
  /* -----------------------------------------------------------
                  TRANSFORMERS
              ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_auditsGetPayload<ReturnType<typeof select>>,
    ): IHubSaleAudit => ({
      ...BbsArticleProvider.json.transform(input.base),
      administrator: HubAdministratorProvider.invert.transform(
        input.customer,
        () =>
          new InternalServerErrorException(
            "The rejection has not been registered by administrator.",
          ),
      ),
      emendations: input.emendations
        .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
        .map(HubSaleAuditEmentationProvider.json.transform),
      rejections: input.rejections
        .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
        .map(HubSaleAuditRejectionProvider.json.transform),
      approval:
        input.approval !== null
          ? HubSaleAuditApprovalProvider.json.transform(input.approval)
          : null,
    });
    export const select = () =>
      ({
        include: {
          base: BbsArticleProvider.json.select(),
          customer: HubAdministratorProvider.invert.select(),
          emendations: HubSaleAuditEmentationProvider.json.select(),
          rejections: HubSaleAuditRejectionProvider.json.select(),
          approval: HubSaleAuditApprovalProvider.json.select(),
        },
      }) satisfies Prisma.hub_sale_auditsFindManyArgs;
  }

  export namespace invert {
    export const transform = (
      input: Prisma.hub_sale_auditsGetPayload<ReturnType<typeof select>>,
    ): IHubSaleAudit.IInvert => ({
      id: input.id,
      administrator: HubAdministratorProvider.invert.transform(
        input.customer,
        () =>
          new InternalServerErrorException(
            "The rejection has not been registered by administrator.",
          ),
      ),
      created_at: input.base.created_at.toISOString(),
      rejected_at: input.state?.rejected_at?.toISOString() ?? null,
      approved_at: input.state?.approved_at?.toISOString() ?? null,
    });
    export const select = () =>
      ({
        include: {
          base: {
            select: {
              id: true,
              created_at: true,
            },
          },
          customer: HubAdministratorProvider.invert.select(),
          rejections: true,
          approval: true,
          state: true,
        },
      }) satisfies Prisma.hub_sale_auditsFindManyArgs;
  }

  /* -----------------------------------------------------------
                READERS
            ----------------------------------------------------------- */
  export const at = async (props: {
    actor: IHubSeller.IInvert | IHubAdministrator.IInvert;
    sale: IEntity;
    id: string;
  }): Promise<IHubSaleAudit> => {
    const record = await find({
      ...props,
      payload: json.select(),
    });
    return json.transform(record);
  };

  export const find = async <
    Payload extends Prisma.hub_sale_auditsFindFirstOrThrowArgs,
  >(props: {
    payload: Payload;
    actor: IHubAdministrator.IInvert | IHubSeller.IInvert;
    sale: IEntity;
    id: string;
  }) => {
    const record = await HubGlobal.prisma.hub_sale_audits.findFirstOrThrow({
      where: {
        id: props.id,
        snapshot: {
          mv_last_audited: {
            sale: {
              id: props.sale.id,
              ...(props.actor.type === "seller"
                ? HubSellerProvider.whereFromCustomerField(props.actor)
                : {}),
            },
          },
        },
      },
      ...props.payload,
    });
    return record as Prisma.hub_sale_auditsGetPayload<Payload>;
  };

  export const isUnapproved = async (props: {
    actor: IHubAdministrator.IInvert | IHubSeller.IInvert;
    sale: IEntity;
    id: string;
  }) => {
    await find({
      ...props,
      payload: {},
    });
    const material =
      await HubGlobal.prisma.mv_hub_sale_last_snapshots.findFirstOrThrow({
        where: {
          hub_sale_id: props.sale.id,
        },
      });
    if (material.last_audited_hub_sale_snapshot_id === null)
      throw ErrorProvider.notFound({
        accessor: "id",
        code: HubSaleAuditErrorCode.NOT_FOUND,
        message: "Audit article not found.",
      });
    else if (
      material.last_audited_hub_sale_snapshot_id ===
      material.approved_audited_hub_sale_snapshot_id
    )
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubSaleAuditErrorCode.APPROVED,
        message: "Audit article already approved.",
      });
    return material;
  };

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const autoApprove = async (sale: IEntity) => {
    const customer: IHubCustomer = await HubCustomerProvider.create({
      request: {
        ip: "127.0.0.1",
      },
      input: {
        external_user: null,
        channel_code: "wrtn",
        href: "http://localhost/TestAutomation",
        referrer: "http://localhost/NodeJS",
        lang_code: null,
      },
    });
    const admin: IHubAdministrator.IInvert =
      await HubAdministratorProvider.login({
        customer,
        input: {
          email: "robot@wrtn.io",
          password: HubGlobal.env.HUB_SYSTEM_PASSWORD,
        },
      });

    const audit: IHubSaleAudit = await create({
      admin,
      sale,
      input: {
        title: "Automated Audit",
        body: "Automated Auditing, so that approved automatically.",
        files: [],
        format: "md",
      },
    });
    audit.approval = await HubSaleAuditApprovalProvider.create({
      admin,
      sale,
      audit,
      input: {
        fee_ratio: 0.15,
        snapshot_id: null,
      },
    });
    return HubSaleAuditDiagnoser.invert(audit);
  };

  export const create = async (props: {
    admin: IHubAdministrator.IInvert;
    sale: IEntity;
    input: IHubSaleAudit.ICreate;
  }) => {
    // CHECK SALE STATUS
    const material =
      await HubGlobal.prisma.mv_hub_sale_last_snapshots.findFirstOrThrow({
        where: {
          hub_sale_id: props.sale.id,
        },
      });
    if (material.approved_hub_sale_snapshot_id !== null)
      throw ErrorProvider.conflict({
        code: HubSaleAuditErrorCode.CREATED,
        message: "Audit article already exists.",
      });

    // ARCHIVE AUDIT
    const record = await HubGlobal.prisma.hub_sale_audits.create({
      data: collect({
        admin: props.admin,
        snapshot: {
          id: material.last_hub_sale_snapshot_id,
        },
        input: props.input,
      }),
      ...json.select(),
    });

    await HubGlobal.prisma.mv_hub_sale_audit_states.create({
      data: {
        hub_sale_audit_id: record.id,
      },
    });

    // MEMOIZE TO MATERIAL
    await HubGlobal.prisma.mv_hub_sale_last_snapshots.update({
      where: {
        hub_sale_id: props.sale.id,
      },
      data: {
        last_audited_hub_sale_snapshot_id: material.last_hub_sale_snapshot_id,
      },
    });
    return json.transform(record);
  };

  export const update = async (props: {
    admin: IHubAdministrator.IInvert;
    sale: IEntity;
    id: string;
    input: IHubSaleAudit.IUpdate;
  }): Promise<IHubSaleAudit.ISnapshot> => {
    await find({
      ...props,
      actor: props.admin,
      payload: {},
    });
    return BbsArticleSnapshotProvider.create({ id: props.id })(props.input);
  };

  const collect = (props: {
    admin: IHubAdministrator.IInvert;
    snapshot: IEntity;
    input: IHubSaleAudit.ICreate;
  }) =>
    ({
      base: {
        create: BbsArticleProvider.collect(
          "sale.audit",
          BbsArticleSnapshotProvider.collect,
        )(props.input),
      },
      customer: {
        connect: { id: props.admin.customer.id },
      },
      member: {
        connect: {
          id: props.admin.member.id,
        },
      },
      snapshot: {
        connect: { id: props.snapshot.id },
      },
    }) satisfies Prisma.hub_sale_auditsCreateInput;
}
