import { HubSaleAuditDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/sales/HubSaleAuditDiagnoser";
import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";
import { IHubSaleAuditApproval } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditApproval";
import { IHubSaleAuditRejection } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditRejection";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { generate_random_sale_audit } from "./generate_random_sale_audit";
import { prepare_random_sale } from "./prepare_random_sale";

export const generate_random_sale = async (
  pool: ConnectionPool,
  state: "agenda" | "approved" | "rejected" | null,
  input?: Partial<IHubSale.ICreate>,
): Promise<IHubSale> => {
  const sale: IHubSale = await HubApi.functional.hub.sellers.sales.create(
    pool.seller,
    await prepare_random_sale(pool, input),
  );
  if (state === null) return sale;

  const audit: IHubSaleAudit = await generate_random_sale_audit(pool, sale);
  if (state === "rejected") {
    const rejection: IHubSaleAuditRejection =
      await HubApi.functional.hub.admins.sales.audits.reject(
        pool.admin,
        sale.id,
        audit.id,
        {
          reversible: true,
        },
      );
    audit.rejections.push(rejection);
  } else if (state === "approved") {
    const approval: IHubSaleAuditApproval =
      await HubApi.functional.hub.admins.sales.audits.approve(
        pool.admin,
        sale.id,
        audit.id,
        {
          snapshot_id: null,
          fee_ratio: 0.015,
        },
      );
    audit.approval = approval;
  }

  sale.latest = true;
  sale.audit = HubSaleAuditDiagnoser.invert(audit);
  return sale;
};
