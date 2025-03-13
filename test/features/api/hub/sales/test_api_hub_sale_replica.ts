import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { prepare_random_sale } from "./internal/prepare_random_sale";

export const test_api_hub_sale_replica = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 판매자 준비
  await test_api_hub_seller_join(pool);

  // 매물 생성
  const input: IHubSale.ICreate = await prepare_random_sale(pool);
  const sale: IHubSale = await HubApi.functional.hub.sellers.sales.create(
    pool.seller,
    input,
  );

  // 레플리카 검증
  const replica: IHubSale.ICreate =
    await HubApi.functional.hub.sellers.sales.replica(pool.seller, sale.id);

  TestValidator.equals("replica", TestGlobal.exceptSaleKeys)(input)({
    ...replica,
    units: replica.units.map((unit) => ({
      ...unit,
      parent_id: null,
      stocks: unit.stocks.map((stock) => ({
        ...stock,
        parent_id: null,
      })),
    })),
  });
};
