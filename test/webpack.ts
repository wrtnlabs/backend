import { DynamicExecutor } from "@nestia/e2e";
import chalk from "chalk";
import cp from "child_process";
import fs from "fs";
import { sleep_for } from "tstl";

import { HubConfiguration } from "../src/HubConfiguration";
import HubApi from "../src/api";
import { PaymentSetupWizard } from "../src/setup/PaymentSetupWizard";
import { StopWatch } from "../src/utils/StopWatch";
import { ConnectionPool } from "./ConnectionPool";

const webpackTest = async (): Promise<void> => {
  console.log(
    [
      "-----------------------------------------------------------",
      " WEBPACK TEST",
      "-----------------------------------------------------------",
    ].join("\n"),
  );
  if (fs.existsSync(HubConfiguration.ROOT + "/dist/server.js") === false)
    throw new Error("Run npm run webpack command first.");

  //----
  // BUILD SERVERS
  //----
  // SETUP RELATED SERVERS
  await StopWatch.trace("Setup Payment")(PaymentSetupWizard.setup);

  // WEBPACK THEM ALL`
  const [payment] = await StopWatch.trace("Webpack Payment")(
    PaymentSetupWizard.webpack,
  );

  // START HUB SERVERS
  const proxy = cp.fork("proxy.js", { cwd: `${HubConfiguration.ROOT}/dist` });
  const server = cp.fork("server.js", ["--no-others"], {
    cwd: `${HubConfiguration.ROOT}/dist`,
  });
  await sleep_for(2_500);

  //----
  // DO TEST
  //----
  const connection: HubApi.IConnection = {
    host: `http://127.0.0.1:${HubConfiguration.API_PORT()}`,
  };
  const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
    prefix: "test",
    location: __dirname + "/features",
    parameters: () => [
      new ConnectionPool({
        host: connection.host,
        encryption: connection.encryption,
      }),
    ],
    onComplete: (exec) => {
      if (exec.error === null) {
        const elapsed: number =
          new Date(exec.completed_at).getTime() -
          new Date(exec.started_at).getTime();
        console.log(
          `  - ${exec.name}: ${chalk.green(elapsed.toLocaleString())} ms`,
        );
      } else console.log(`  - ${exec.name}: ${chalk.red(exec.error.name)}`);
    },
  });

  // REPORT EXCEPTIONS
  const exceptions: Error[] = report.executions
    .filter((exec) => exec.error !== null)
    .map((exec) => exec.error!);
  if (exceptions.length === 0) {
    console.log("Success");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
  } else {
    for (const exp of exceptions) console.log(exp);
    console.log("Failed");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
  }

  // CLOSE SERVERS
  payment.kill();
  proxy.kill();
  server.kill();
};
webpackTest().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
