import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../hub/actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../../hub/actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../../hub/carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "../../hub/orders/internal/generate_random_order";
import { generate_random_order_publish } from "../../hub/orders/internal/generate_random_order_publish";
import { generate_random_sale } from "../../hub/sales/internal/generate_random_sale";

export const test_api_studio_meta_chat_session_goods = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  const sales: IHubSale[] = await ArrayUtil.asyncRepeat(2)(() =>
    generate_random_sale(pool, "approved"),
  );
  const commodities: IHubCartCommodity[] = await ArrayUtil.asyncMap(sales)(
    (s) => generate_random_cart_commodity(pool, s),
  );
  const goods: IHubOrderGood[] = await ArrayUtil.asyncMap(commodities)(
    async (c) => {
      const o = await generate_random_order(pool, [c]);
      o.publish = await generate_random_order_publish(pool, o);
      return o.goods[0];
    },
  );

  const session: IStudioMetaChatSession =
    await HubApi.functional.studio.customers.meta.chat.sessions.create(
      pool.customer,
      {
        title: "something",
        good_ids: goods.map((g) => g.id),
      },
    );
  TestValidator.equals("session.goods")(session.goods.map((g) => g.id))(
    goods.map((g) => g.id),
  );
};
