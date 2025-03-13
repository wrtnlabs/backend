import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";
import { IHubSaleAuditComment } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditComment";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../internal/generate_random_sale";
import { generate_random_sale_audit } from "../internal/generate_random_sale_audit";
import { generate_random_sale_audit_comment } from "../internal/generate_random_sale_audit_comment";

export const test_api_hub_sale_audit_comment_store = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, null);
  const audit: IHubSaleAudit = await generate_random_sale_audit(pool, sale);

  const comments: IHubSaleAuditComment[] = await ArrayUtil.asyncMap([
    "admins",
    "sellers",
  ] as const)((actor) =>
    generate_random_sale_audit_comment(pool, actor, sale, audit),
  );
  const page: IPage<IHubSaleAuditComment> =
    await HubApi.functional.hub.sellers.sales.audits.comments.index(
      pool.seller,
      sale.id,
      audit.id,
      {
        limit: comments.length,
        sort: ["+created_at"],
      },
    );
  TestValidator.equals("create")(comments)(page.data);
};
