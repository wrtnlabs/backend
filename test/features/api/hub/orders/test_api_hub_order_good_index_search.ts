import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_order } from "./internal/generate_random_order";
import { generate_random_order_publish } from "./internal/generate_random_order_publish";

export const test_api_hub_order_good_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);
  await test_api_hub_customer_join(pool);

  const saleList: IHubSale[] = await ArrayUtil.asyncRepeat(4)(async () => {
    const sale: IHubSale = await generate_random_sale(pool, "approved");
    await ArrayUtil.asyncRepeat(4)(async () => {
      const commodity: IHubCartCommodity = await generate_random_cart_commodity(
        pool,
        sale,
      );
      const order: IHubOrder = await generate_random_order(pool, [commodity]);
      order.publish = await generate_random_order_publish(pool, order);
    });
    return sale;
  });

  for (const sale of saleList) {
    const page: IPage<IHubOrderGood.IInvert> =
      await HubApi.functional.hub.sellers.orders.goods.index(
        pool.seller,
        null,
        {
          search: {
            sale: {
              id: sale.id,
            },
          },
        },
      );
    TestValidator.equals("length")(page.data.length)(4);
    TestValidator.equals("sale.id")(
      ArrayUtil.repeat(page.data.length)(() => sale.id),
    )(page.data.map((good) => good.commodity.sale.id));
  }
};
