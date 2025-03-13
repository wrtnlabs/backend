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

export const test_api_hub_sale_audit_comment_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, null);
  const audit: IHubSaleAudit = await generate_random_sale_audit(pool, sale);
  await ArrayUtil.asyncRepeat(25)(async () => {
    const actor = Math.random() < 0.5 ? "admins" : "sellers";
    await generate_random_sale_audit_comment(pool, actor, sale, audit);
  });

  const expected: IPage<IHubSaleAuditComment> =
    await HubApi.functional.hub.sellers.sales.audits.comments.index(
      pool.seller,
      sale.id,
      audit.id,
      {
        limit: REPEAT,
        search: {
          body: "test",
        },
      },
    );

  const search = TestValidator.search("comments.index")(
    async (input: IHubSaleAuditComment.IRequest.ISearch) => {
      const page: IPage<IHubSaleAuditComment> =
        await HubApi.functional.hub.sellers.sales.audits.comments.index(
          pool.seller,
          sale.id,
          audit.id,
          {
            limit: REPEAT,
            search: input,
          },
        );
      return page.data;
    },
  )(expected.data, 4);
  await search({
    fields: ["body"],
    values: (c) => [c.snapshots.at(-1)!.body.substring(0, 10)],
    request: ([body]) => ({ body }),
    filter: (c, [body]) => c.snapshots.at(-1)!.body.includes(body),
  });
};
const REPEAT: number = 25;
