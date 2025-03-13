import { OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";
import cp from "child_process";
import fs from "fs";
import { Singleton } from "tstl";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { HubConfiguration } from "../../../../../../src/HubConfiguration";
import { HubGlobal } from "../../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../../ConnectionPool";
import { generate_random_sale } from "./generate_random_sale";
import { prepare_random_sale_unit } from "./prepare_random_sale_unit";

export const generate_random_sale_of_hub_system = async (
  pool: ConnectionPool,
  state: "agenda" | "approved" | "rejected" | null,
  customer: IHubCustomer.IAuthorized,
): Promise<IHubSale> => {
  // PREPARE SWAGGER ASSET
  const host: string = `http://${
    HubGlobal.env.LOCAL_IP ?? "localhost"
  }:${HubConfiguration.API_PORT()}`;
  const swagger:
    | SwaggerV2.IDocument
    | OpenApiV3.IDocument
    | OpenApiV3_1.IDocument = document.get();

  // CREATE SALE
  const sale: IHubSale = await generate_random_sale(pool, state, {
    units: [
      prepare_random_sale_unit({
        host: {
          real: host,
          dev: host,
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
      value: customer.setHeaders.Authorization,
      in: "header",
      description: null,
    },
  );

  // RETURNS THE SALE
  return sale;
};

const document = new Singleton(() => {
  const location: string = `${HubConfiguration.ROOT}/packages/api/swagger.json`;
  if (fs.existsSync(location) === false)
    cp.execSync(`npm run build:swagger`, {
      stdio: "ignore",
      cwd: HubConfiguration.ROOT,
    });
  return typia.assert<
    SwaggerV2.IDocument | OpenApiV3.IDocument | OpenApiV3_1.IDocument
  >(require(location));
});
