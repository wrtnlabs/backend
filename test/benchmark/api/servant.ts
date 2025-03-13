import { DynamicBenchmarker } from "@nestia/benchmark";

import { HubConfiguration } from "../../../src/HubConfiguration";
import { ConnectionPool } from "../../ConnectionPool";

DynamicBenchmarker.servant({
  connection: {
    host: `http://127.0.0.1:${HubConfiguration.API_PORT()}`,
  },
  location: `${__dirname}/../features`,
  parameters: (connection) => [new ConnectionPool(connection)],
  prefix: "test_api_",
}).catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
