import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";
import { IHubSaleAuditComment } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditComment";
import { IHubSaleInquiryComment } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiryComment";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../internal/generate_random_sale";
import { generate_random_sale_audit } from "../internal/generate_random_sale_audit";
import { generate_random_sale_audit_comment } from "../internal/generate_random_sale_audit_comment";

export const test_api_hub_sale_audit_comment_update = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, null);
  const audit: IHubSaleAudit = await generate_random_sale_audit(pool, sale);

  const validate = async (actor: "admins" | "sellers") => {
    const comment: IHubSaleAuditComment =
      await generate_random_sale_audit_comment(pool, actor, sale, audit);
    comment.snapshots.push(
      ...(await ArrayUtil.asyncRepeat(3)(async () => {
        const snapshot: IHubSaleInquiryComment.ISnapshot =
          await HubApi.functional.hub[actor].sales.audits.comments.update(
            actor === "admins" ? pool.admin : pool.seller,
            sale.id,
            audit.id,
            comment.id,
            {
              format: "txt",
              body: RandomGenerator.content()()(),
              files: [],
            },
          );
        return snapshot;
      })),
    );

    const read: IHubSaleAuditComment =
      await HubApi.functional.hub.sellers.sales.audits.comments.at(
        pool.seller,
        sale.id,
        audit.id,
        comment.id,
      );
    TestValidator.equals(actor)(comment)(read);
  };
  await validate("admins");
  await validate("sellers");
};
