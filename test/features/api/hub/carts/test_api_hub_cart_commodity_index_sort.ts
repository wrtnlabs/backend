import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_cart_commodity } from "./internal/generate_random_cart_commodity";

export const test_api_hub_cart_commodity_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  //----
  // PREPARE ASSETS
  //----
  // ACTORS
  await test_api_hub_customer_create(pool);
  await test_api_hub_admin_login(pool);

  // 25 명의 판매자, 25 개의 매물, 그리고 25 개의 장바구니
  //
  // Publish 설정 확률 75%
  // Expiration date 설정 확률 56.25%
  await ArrayUtil.asyncRepeat(COUNT)(async () => {
    await test_api_hub_seller_join(pool);
    const sale: IHubSale = await generate_random_sale(pool, "approved");
    return generate_random_cart_commodity(pool, sale);
  });

  //----
  // TEST SORT
  //----
  // 검증기 준비
  const validator = TestValidator.sort("carts.index")<
    IHubCartCommodity,
    IHubCartCommodity.IRequest.SortableColumns,
    IPage.Sort<IHubCartCommodity.IRequest.SortableColumns>
  >(async (input: IPage.Sort<IHubCartCommodity.IRequest.SortableColumns>) => {
    const page: IPage<IHubCartCommodity> =
      await HubApi.functional.hub.customers.carts.commodities.index(
        pool.customer,
        null,
        {
          sort: input,
        },
      );
    return page.data;
  });

  // 검증 항목 나열
  const components = [
    validator("commodity.created_at")(
      GaffComparator.dates((c) => c.created_at),
    ),
    validator("sale.created_at")(
      GaffComparator.dates((c) => c.sale.created_at),
    ),
    validator("sale.opened_at")(
      GaffComparator.dates(
        (c) => c.sale.opened_at ?? new Date("9999-12-31").toISOString(),
      ),
    ),
    validator("sale.closed_at")(
      GaffComparator.dates(
        (c) => c.sale.closed_at ?? new Date("9999-12-31").toISOString(),
      ),
    ),
  ];

  // 검증 실시
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};

const COUNT = 25;
