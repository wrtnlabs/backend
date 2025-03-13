import { ArrayUtil, TestValidator } from "@nestia/e2e";
import { PrismaClient } from "@prisma/client";
import { OpenApi } from "@samchon/openapi";
import fs from "fs";
import path from "path";
import { v4 } from "uuid";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubOrderGoodCallAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/activity/IHubOrderGoodCallAggregate";
import { IHubSaleCallRanking } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/activity/IHubSaleCallRanking";

import { HubConfiguration } from "../../../../../src/HubConfiguration";
import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { prepare_random_bbs_article_store } from "../../common/prepare_random_bbs_article_store";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { prepare_random_cart_commodity } from "../carts/internal/prepare_random_cart_commodity";
import { generate_random_order } from "../orders/internal/generate_random_order";
import { generate_random_order_publish } from "../orders/internal/generate_random_order_publish";
import { generate_random_sale_of_hub_system } from "../sales/internal/generate_random_sale_of_hub_system";

export const test_api_hub_statistics_call = async (
  pool: ConnectionPool,
): Promise<void> => {
  //----
  // 중개 상품 구매하기
  //----
  // 액터 준비
  await test_api_hub_admin_login(pool);
  const customer: IHubCustomer.IAuthorized = await test_api_hub_customer_join(
    pool,
    pool.customer,
    {
      email: "asdfasdf@wrtn.io",
    },
  );
  await test_api_hub_seller_join(pool, { email: "qwerasd@wrtn.io" });

  // 3 sales
  // 3 orders
  // 10 calls
  const saleList: IHubSale[] = await ArrayUtil.asyncRepeat(3)(async () => {
    const sale: IHubSale = await generate_random_sale_of_hub_system(
      pool,
      "approved",
      customer,
    );
    await ArrayUtil.asyncRepeat(3)(async () => {
      const commodity: IHubCartCommodity = await generate_random_cart_commodity(
        pool,
        sale,
      );
      const order: IHubOrder = await generate_random_order(pool, [commodity]);
      order.publish = await generate_random_order_publish(pool, order);

      // 스웨거 정보 열람하기
      const good: IHubOrderGood = order.goods[0];
      const swagger: OpenApi.IDocument =
        await HubApi.functional.hub.customers.orders.goods.snapshots.swagger(
          pool.customer,
          order.id,
          good.id,
          good.commodity.sale.snapshot_id,
          {
            unit_id: good.commodity.sale.units[0].id,
          },
        );

      const connection: HubApi.IConnection = {
        host: swagger.servers![1].url,
        headers: pool.customer.headers,
      };
      await ArrayUtil.asyncRepeat(REPEAT)(async () => {
        await ArrayUtil.asyncMap([
          write_question, // 201
          purchase_commodity, // 201
          read_sale, // 200
          forbidden, // 403
          notFound, // 404
        ])(async (func) => {
          try {
            await func({ sale, order })(connection);
          } catch {}
        });
      });
      await statisticsScheduler();
    });
    return sale;
  });

  const total: IHubOrderGoodCallAggregate =
    await HubApi.functional.hub.customers.statistics.orders.goods.calls.entire(
      pool.customer,
      {
        sale_ids: saleList.map((s) => s.id),
      },
    );
  TestValidator.equals("success")(total.success)(REPEAT * 27);
  TestValidator.equals("4xx")(total.status_4xx)(REPEAT * 18);

  for (const term of [
    "hour",
    "day",
    "week",
    "month",
    "quarter",
    "year",
  ] as const) {
    await HubApi.functional.hub.customers.statistics.orders.goods.calls.index(
      pool.customer,
      {
        term,
        search: {
          from: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
            .toISOString()
            .substring(0, 10),
        },
        limit: 100,
      },
    );
  }

  const ranking: IPage<IHubSaleCallRanking> =
    await HubApi.functional.hub.customers.statistics.sales.calls.rankings.index(
      pool.customer,
      {},
    );
  TestValidator.equals("ranking.value")(ranking.data[0].value)(1);
  TestValidator.equals("ranking.count")(ranking.data[0].count)(REPEAT * 15);
  TestValidator.equals("ranking.success")(ranking.data[0].success)(REPEAT * 15);
};

const write_question =
  (props: { sale: IHubSale; order: IHubOrder }) =>
  async (connection: HubApi.IConnection): Promise<void> => {
    await HubApi.functional.hub.customers.sales.questions.create(
      connection,
      props.sale.id,
      {
        ...prepare_random_bbs_article_store(),
        secret: true,
      },
    );
  };
const purchase_commodity =
  (props: { sale: IHubSale; order: IHubOrder }) =>
  async (connection: HubApi.IConnection): Promise<void> => {
    await HubApi.functional.hub.customers.carts.commodities.create(
      connection,
      null,
      prepare_random_cart_commodity(props.sale),
    );
  };
const read_sale =
  (props: { sale: IHubSale; order: IHubOrder }) =>
  async (connection: HubApi.IConnection): Promise<void> => {
    await HubApi.functional.hub.customers.sales.at(connection, props.sale.id);
  };
const forbidden =
  (props: { sale: IHubSale; order: IHubOrder }) =>
  async (connection: HubApi.IConnection): Promise<void> => {
    await HubApi.functional.hub.sellers.sales.replica(
      connection,
      props.sale.id,
    );
  };
const notFound =
  (_props: { sale: IHubSale; order: IHubOrder }) =>
  async (connection: HubApi.IConnection): Promise<void> => {
    await HubApi.functional.hub.customers.sales.at(connection, v4());
  };

// Materialized View REFRESH
const statisticsScheduler = async () => {
  const root = {
    account: process.argv[2] ?? "postgres",
    password: process.argv[3] ?? "root",
  };

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: createDatabaseUrl(root),
        },
      },
    });

    try {
      await refreshMaterializedViews();
    } finally {
      await prisma.$disconnect();
    }
  } catch (err) {
    console.error("Failed to update materialized view:", err);
  }
};

const createDatabaseUrl = (root: {
  account: string;
  password: string;
}): string => {
  return `postgresql://${root.account}:${root.password}@${HubGlobal.env.HUB_POSTGRES_HOST}:${HubGlobal.env.HUB_POSTGRES_PORT}/postgres`;
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

const REPEAT = 10;
