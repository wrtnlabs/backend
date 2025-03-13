import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../internal/generate_random_sale";

export const test_api_hub_sale_audit_index_search = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_admin_login(pool);

  for (const state of ["approved", "agenda", "rejected"] as (
    | "approved"
    | "agenda"
    | "rejected"
    | null
  )[]) {
    await ArrayUtil.asyncRepeat(25)(async () => {
      await test_api_hub_seller_join(pool);
      await generate_random_sale(pool, state);
    });
  }

  const total: IPage<IHubSale.ISummary> =
    await HubApi.functional.hub.admins.sales.index(pool.admin, {
      limit: 25,
      sort: ["-sale.created_at"],
    });

  const search = TestValidator.search("sales.index")(
    async (input: IHubSale.IRequest.ISearch) => {
      const page: IPage<IHubSale.ISummary> =
        await HubApi.functional.hub.admins.sales.index(pool.admin, {
          limit: total.data.length,
          search: input,
          sort: ["-sale.created_at"],
        });
      return page.data;
    },
  )(total.data, 4);

  //----
  // IDENTIFIER
  //----

  //----
  // ADMIN
  //----
  await search({
    fields: ["sale.audit.approved_at"],
    values: (sale) => [sale.audit],
    request: ([]) => ({
      audit: {
        state: "approved",
      },
    }),
    filter: (sale) =>
      sale.audit?.approved_at !== null && sale.audit?.administrator !== null,
  });

  await search({
    fields: ["sale.audit.rejected_at"],
    values: (sale) => [sale.audit],
    request: ([]) => ({
      audit: {
        state: "rejected",
      },
    }),
    filter: (sale) =>
      sale.audit?.rejected_at !== null && sale.audit?.approved_at === null,
  });

  await search({
    fields: ["sale.audit.approved_at & sale.audit.rejected_at"],
    values: (sale) => [sale.audit],
    request: ([]) => ({
      audit: {
        state: "agenda",
      },
    }),
    filter: (sale) =>
      sale.audit?.rejected_at === null && sale.audit?.approved_at === null,
  });

  await search({
    fields: ["sale.audit"],
    values: (sale) => [sale.audit],
    request: ([]) => ({
      audit: {
        state: "none",
      },
    }),
    filter: (sale) => sale.audit === null,
  });

  await search({
    fields: ["sale.audit undefined"],
    values: (sale) => [sale.audit],
    request: ([]) => ({}),
    filter: (sale) => sale.audit !== null,
  });
};
