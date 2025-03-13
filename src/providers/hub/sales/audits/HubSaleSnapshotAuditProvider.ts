import { InternalServerErrorException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";

import { HubGlobal } from "../../../../HubGlobal";
import { LanguageUtil } from "../../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../../utils/PaginationUtil";
import { BbsArticleSnapshotProvider } from "../../../common/BbsArticleSnapshotProvider";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubAdministratorProvider } from "../../actors/HubAdministratorProvider";
import { HubSaleSnapshotProvider } from "../HubSaleSnapshotProvider";
import { HubSaleAuditApprovalProvider } from "./HubSaleAuditApprovalProvider";
import { HubSaleAuditEmentationProvider } from "./HubSaleAuditEmentationProvider";
import { HubSaleAuditRejectionProvider } from "./HubSaleAuditRejectionProvider";

export namespace HubSaleSnapshotAuditProvider {
  export namespace summary {
    export const select = (langCode: string | null) =>
      ({
        include: {
          base: {
            include: {
              snapshots: BbsArticleSnapshotProvider.json.select(),
              mv_last: {
                include: {
                  snapshot: BbsArticleSnapshotProvider.json.select(),
                },
              },
            },
          },
          customer: HubAdministratorProvider.invert.select(),
          emendations: HubSaleAuditEmentationProvider.json.select(),
          rejections: HubSaleAuditRejectionProvider.json.select(),
          approval: HubSaleAuditApprovalProvider.json.select(),
          state: true,
          snapshot: HubSaleSnapshotProvider.summary.select(langCode),
        },
      }) satisfies Prisma.hub_sale_auditsFindManyArgs;

    export const transform = (
      input: Prisma.hub_sale_auditsGetPayload<ReturnType<typeof select>>,
    ): IHubSaleAudit.ISummary => ({
      id: input.id,
      rejected_at: input.state?.rejected_at?.toISOString() ?? null,
      created_at: input.base?.created_at.toISOString() ?? null,
      approved_at: input.state?.approved_at?.toISOString() ?? null,
      administrator: HubAdministratorProvider.invert.transform(
        input.customer,
        () =>
          new InternalServerErrorException(
            "The rejection has not been registered by administrator.",
          ),
      ),
      title: input.base.mv_last!.snapshot.title,
      updated_at: input.base.mv_last!.snapshot.created_at.toISOString(),
    });
  }

  export const index = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    input: IHubSaleAudit.IRequest;
  }): Promise<IPage<IHubSaleAudit.ISummary>> => {
    const record = HubGlobal.prisma.hub_sales.findFirst({
      where: {
        id: props.sale.id,
      },
    });
    if (!record) {
      throw ErrorProvider.notFound([
        {
          accessor: "saleId",
          code: HubSaleErrorCode.SALE_NOT_FOUND,
          message: "The sale is not found.",
        },
      ]);
    }
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_sale_audits,
      payload: summary.select(
        LanguageUtil.getNonNullActorLanguage(props.actor),
      ),
      transform: summary.transform,
    })({
      where: {
        snapshot: {
          hub_sale_id: props.sale.id,
        },
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ base: { created_at: "desc" } }],
    } satisfies Prisma.hub_sale_auditsFindManyArgs)(props.input);
  };

  const orderBy = (
    key: IHubSaleAudit.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    (key === "audit.created_at"
      ? { base: { created_at: direction } }
      : key === "audit_rejected_at"
        ? { state: { rejected_at: direction } }
        : key === "audit.approved_at"
          ? { state: { approved_at: direction } }
          : {}) satisfies Prisma.hub_sale_auditsOrderByWithRelationInput;
}
