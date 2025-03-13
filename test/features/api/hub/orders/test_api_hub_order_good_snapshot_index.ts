import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_sale_audit } from "../sales/internal/generate_random_sale_audit";
import { generate_random_order } from "./internal/generate_random_order";
import { generate_random_order_publish } from "./internal/generate_random_order_publish";

export const test_api_hub_order_good_snapshot_index = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order);

  await ArrayUtil.asyncRepeat(4)(() => update(pool)(sale));

  const snapshots: IPage<IHubSaleSnapshot.ISummary> =
    await HubApi.functional.hub.customers.orders.goods.snapshots.index(
      pool.customer,
      order.id,
      order.goods[0].id,
      {
        limit: 5,
      },
    );
  TestValidator.equals("snapshots.length")(snapshots.data.length)(5);
};

const update =
  (pool: ConnectionPool) =>
  async (sale: IEntity): Promise<void> => {
    const replica: IHubSale.ICreate =
      await HubApi.functional.hub.sellers.sales.replica(pool.seller, sale.id);
    const updated: IHubSale = await HubApi.functional.hub.sellers.sales.update(
      pool.seller,
      sale.id,
      {
        ...replica,
        version: `0.1.${++patch.value}`,
      },
    );

    const audit: IHubSaleAudit = await generate_random_sale_audit(
      pool,
      updated,
    );
    await HubApi.functional.hub.admins.sales.audits.approve(
      pool.admin,
      updated.id,
      audit.id,
      {
        fee_ratio: 0.1,
        snapshot_id: null,
      },
    );
  };

const patch = { value: 1 };
