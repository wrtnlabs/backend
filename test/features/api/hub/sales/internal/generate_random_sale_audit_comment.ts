import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";
import { IHubSaleAuditComment } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditComment";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_sale_audit_comment = async (
  pool: ConnectionPool,
  actor: "admins" | "sellers",
  sale: IHubSale,
  audit: IHubSaleAudit,
  input?: Partial<IHubSaleAuditComment.ICreate>,
): Promise<IHubSaleAuditComment> => {
  const comment: IHubSaleAuditComment = await HubApi.functional.hub[
    actor
  ].sales.audits.comments.create(
    actor === "admins" ? pool.admin : pool.seller,
    sale.id,
    audit.id,
    {
      format: "txt",
      body: RandomGenerator.content()()(),
      files: [],
      ...(input ?? {}),
    },
  );
  return comment;
};
