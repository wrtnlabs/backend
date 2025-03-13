import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";
import { IHubSaleAuditApproval } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditApproval";
import { IHubSaleAuditRejection } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditRejection";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../internal/generate_random_sale";
import { generate_random_sale_audit } from "../internal/generate_random_sale_audit";
import { prepare_random_sale } from "../internal/prepare_random_sale";

export const test_api_hub_sale_snapshot_audit_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_create(pool);

  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, null);

  await ArrayUtil.asyncRepeat(10)(async () => {
    await HubApi.functional.hub.sellers.sales.update(
      pool.seller,
      sale.id,
      await prepare_random_sale(pool),
    );

    for (const state of ["none", "agenda", "rejected", "approved"] as const) {
      if (state === "none") {
        return;
      }

      const audit: IHubSaleAudit = await generate_random_sale_audit(pool, sale);
      if (state === "agenda") {
        return;
      }

      if (state === "rejected") {
        await ArrayUtil.asyncRepeat(10)(async () => {
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
        });
        return;
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
    }
  });

  const total: IPage<IHubSaleAudit.ISummary> =
    await HubApi.functional.hub.admins.sales.snapshots.audits.index(
      pool.admin,
      sale.id,
      {
        limit: REPEAT,
      },
    );

  const validator = TestValidator.sort("audit.index")<
    IHubSaleAudit.ISummary,
    IHubSaleAudit.IRequest.SortableColumns,
    IPage.Sort<IHubSaleAudit.IRequest.SortableColumns>
  >(async (input) => {
    const page: IPage<IHubSaleAudit.ISummary> =
      await HubApi.functional.hub.admins.sales.snapshots.audits.index(
        pool.admin,
        sale.id,
        {
          limit: total.data.length,
          sort: input,
        },
      );
    return page.data;
  });

  const components = [
    // AUDIT
    validator("audit.created_at")(GaffComparator.dates((x) => x.created_at)),
    validator("audit_rejected_at")(
      GaffComparator.dates(
        (x) => x.rejected_at ?? new Date("9999-12-31").toISOString(),
      ),
    ),
    validator("audit.approved_at")(
      GaffComparator.dates(
        (x) => x.approved_at ?? new Date("9999-12-31").toISOString(),
      ),
    ),
  ];

  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};

const REPEAT = 25;
