import { ArrayUtil, TestValidator } from "@nestia/e2e";

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

export const test_api_hub_cart_commodity_index_search = async (
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
  const total: IHubCartCommodity[] = await ArrayUtil.asyncRepeat(COUNT)(
    async () => {
      await test_api_hub_seller_join(pool);
      const sale: IHubSale = await generate_random_sale(pool, "approved");
      return generate_random_cart_commodity(pool, sale);
    },
  );

  const search = TestValidator.search("sales.index")(
    async (input: IHubCartCommodity.IRequest.ISearch) => {
      const page: IPage<IHubCartCommodity> =
        await HubApi.functional.hub.customers.carts.commodities.index(
          pool.customer,
          null,
          {
            limit: total.length,
            search: input,
            sort: ["-commodity.created_at"],
          },
        );
      return page.data;
    },
  )(total, 4);

  await search({
    fields: ["sale.content.title"],
    values: (commodity) => [commodity.sale.content.title],
    request: ([title]) => ({ sale: { title } }),
    filter: (commodity, [title]) =>
      commodity.sale.content.title.includes(title),
  });

  if (total.every((commodity) => commodity.sale.categories.length > 0))
    await search({
      fields: ["category_ids"],
      values: (commodity) => [commodity.sale.categories.map((c) => c.id)],
      request: ([category_ids]) => ({
        sale: { category_ids },
      }),
      filter: (commodity, [ids]) =>
        commodity.sale.categories.some((c) => ids.includes(c.id)),
    });

  await search({
    fields: ["sale.tags"],
    values: (commodity) => [commodity.sale.content.tags],
    request: ([tags]) => ({ sale: { tags } }),
    filter: (commodity, [tags]) =>
      commodity.sale.content.tags.some((t) => tags.includes(t)),
  });

  await search({
    fields: ["seller.mobile"],
    values: (commodity) => [commodity.sale.seller.citizen!.mobile],
    request: ([mobile]) => ({ sale: { seller: { mobile } } }),
    filter: (commodity, [mobile]) =>
      commodity.sale.seller.citizen!.mobile === mobile,
  });
};

const COUNT = 25;
