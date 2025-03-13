import { TestValidator } from "@nestia/e2e";
import fs from "fs";
import path from "path";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";
import { ActorPath } from "@wrtnlabs/os-api/lib/typings/ActorPath";

import { HubConfiguration } from "../../../../../src/HubConfiguration";
import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "../orders/internal/generate_random_order";
import { generate_random_order_publish } from "../orders/internal/generate_random_order_publish";
import { generate_random_sale } from "./internal/generate_random_sale";
import { generate_random_sale_audit } from "./internal/generate_random_sale_audit";

export const test_api_hub_sale_at = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 관리자, 고객 및 판매자 모두 준비
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_create(pool);
  await test_api_hub_seller_join(pool);

  // 매물 및 검증기 준비
  const sale: IHubSale = await generate_random_sale(pool, null);

  TestValidator.equals("aggregate.view.count")(
    sale.aggregate.view.total_view_count,
  )(0);

  const validate = async (viewToCustomer: boolean) => {
    const read = async (actor: ActorPath) => {
      await HubApi.functional.hub[actor].sales.at(
        actor === "admins"
          ? pool.admin
          : actor === "customers"
            ? pool.customer
            : pool.seller,
        sale.id,
      );
    };
    await read("admins");
    await read("sellers");
    if (viewToCustomer) await read("customers");
    else
      await TestValidator.httpError("customer")(404)(() => read("customers"));
  };

  // 심사조차 없는 상태
  await validate(false);

  // 심사 발제
  const audit: IHubSaleAudit = await generate_random_sale_audit(pool, sale);
  await validate(false);

  // 심사 거절
  audit.rejections.push(
    await HubApi.functional.hub.admins.sales.audits.reject(
      pool.admin,
      sale.id,
      audit.id,
      {
        reversible: true,
      },
    ),
  );
  await validate(false);

  // 심사 승인 - 비로소 고객이 열람 가능
  audit.approval = await HubApi.functional.hub.admins.sales.audits.approve(
    pool.admin,
    sale.id,
    audit.id,
    {
      snapshot_id: null,
      fee_ratio: 0.015,
    },
  );
  await validate(true);

  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order);

  await refreshMaterializedViews();

  const result: IHubSale = await HubApi.functional.hub.customers.sales.at(
    pool.customer,
    sale.id,
  );

  TestValidator.equals("aggregate.view.count")(
    result.aggregate.view.total_view_count,
  )(2);
};

const refreshMaterializedViews = async (): Promise<void> => {
  const directory = `${HubConfiguration.ROOT}/src/setup/views`;
  for (const file of await fs.promises.readdir(directory)) {
    if (!file.endsWith(".sql")) continue;

    const filenameWithoutExtension = path.basename(file, ".sql");

    await HubGlobal.prisma.$executeRawUnsafe(
      `REFRESH MATERIALIZED VIEW CONCURRENTLY hub.${filenameWithoutExtension};`,
    );
  }
};
