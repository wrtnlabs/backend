import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";
import { Singleton } from "tstl";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleUnitStockPrice } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStockPrice";

import { HubGlobal } from "../../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../../ConnectionPool";
import { generate_random_sale } from "./generate_random_sale";
import { prepare_random_sale_unit } from "./prepare_random_sale_unit";

export const generate_random_sale_of_toss_payments = async (
  pool: ConnectionPool,
  state: "agenda" | "approved" | "rejected" | null,
  price?: IHubSaleUnitStockPrice.ICreate,
): Promise<IHubSale> => {
  // CHECK WHETHER CUSTOMER INFORMATION EXISTS OR NOT
  const swagger: OpenApi.IDocument = document.get();

  // PREPARE SWAGGER ASSET
  const sale: IHubSale = await generate_random_sale(pool, state, {
    units: [
      prepare_random_sale_unit({
        host: {
          real: `http://${HubGlobal.env.LOCAL_IP ?? "localhost"}:30771`,
          dev: `http://${HubGlobal.env.LOCAL_IP ?? "localhost"}:30771`,
        },
        swagger,
        options: [],
        stocks: [
          {
            name: "Main Stock",
            choices: [],
            prices: [
              {
                threshold: 0,
                fixed: 0,
                variable: 100,
                ...price,
              },
            ],
          },
        ],
      }),
    ],
  });

  // ADD SPECIAL HEADER PARAMETER
  await HubApi.functional.hub.sellers.sales.snapshots.units.parameters.create(
    pool.seller,
    sale.id,
    sale.snapshot_id,
    sale.units[0].id,
    {
      key: "Authorization",
      value: `Basic ${btoa("test_ak_ZORzdMaqN3wQd5k6ygr5AkYXQGwy:")}`,
      in: "header",
      description: null,
    },
  );
  return sale;
};

const document = new Singleton(() =>
  OpenApi.convert(
    typia.assert<
      SwaggerV2.IDocument | OpenApiV3.IDocument | OpenApiV3_1.IDocument
    >(require("toss-payments-server-api/swagger.json")),
  ),
);
