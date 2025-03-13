import { OpenApi } from "@samchon/openapi";
import cp from "child_process";
import { copy } from "copy-paste";
import express from "express";

import { HubBackend } from "../../src/HubBackend";
import { HubConfiguration } from "../../src/HubConfiguration";
import { PaymentSetupWizard } from "../../src/setup/PaymentSetupWizard";
import { ConnectionPool } from "../ConnectionPool";
import { test_api_hub_order_good_api_call_of_toss_payments } from "../features/api/hub/orders/test_api_hub_order_good_api_call_of_toss_payments";

const main = async (): Promise<void> => {
  // OPEN SERVERS
  await PaymentSetupWizard.start();
  cp.fork(
    `${__dirname}/../../src/executable/proxy.${__filename.substring(
      __filename.length - 2,
    )}`,
    {
      stdio: "inherit",
    },
  );
  const backend: HubBackend = new HubBackend();
  await backend.open();

  // GENERATE SALE AND PURCHASE IT
  const pool = new ConnectionPool({
    host: `http://127.0.0.1:${HubConfiguration.API_PORT()}`,
  });
  const [swagger, token]: [OpenApi.IDocument, string] =
    await test_api_hub_order_good_api_call_of_toss_payments(pool);

  console.log(swagger.components.securitySchemes);

  // OPEN THE SWAGGER SERVER
  const app = express();
  const swaggerUi = require("swagger-ui-express");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger));
  app.listen(37810);

  console.log("\n");
  console.log("-----------------------------------------------------------");
  console.log("\n Swagger UI Address: http://localhost:37810/api-docs \n");
  console.log("-----------------------------------------------------------");
  console.log("Authorization token copied to your clipboard.");
  copy(token);
};
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
