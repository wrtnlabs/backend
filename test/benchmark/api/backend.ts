import cp from "child_process";
import { MutexServer } from "mutex-server";
import { WorkerServer } from "tgrid";
import { IPointer, sleep_for } from "tstl";

import { HubBackend } from "../../../src/HubBackend";
import { HubGlobal } from "../../../src/HubGlobal";
import { HubMutex } from "../../../src/HubMutex";
import { HubSetupWizard } from "../../../src/setup/HubSetupWizard";
import { PaymentSetupWizard } from "../../../src/setup/PaymentSetupWizard";
import { StopWatch } from "../../../src/utils/StopWatch";
import { IBenchmarkBackend } from "./IBenchmarkBackend";

const main = async () => {
  const closer: IPointer<null | (() => Promise<void>)> = {
    value: null,
  };
  const worker: WorkerServer<null, IBenchmarkBackend, null> =
    new WorkerServer();
  await worker.open({
    open: async (options): Promise<void> => {
      // CONFIGURE
      HubGlobal.testing = true;
      if (options.reset || !PaymentSetupWizard.prepared())
        await StopWatch.trace("Payment Server")(() =>
          PaymentSetupWizard.setup(),
        );
      if (options.reset) {
        await StopWatch.trace("Reset DB")(HubSetupWizard.schema);
        await StopWatch.trace("Seed Data")(HubSetupWizard.seed);
      }

      // OPEN SERVER
      const payment: cp.ChildProcess = await PaymentSetupWizard.start();
      const proxy: cp.ChildProcess = cp.fork(
        `${__dirname}/../../src/executable/proxy.js`,
        {
          stdio: "inherit",
        },
      );
      const mutex: MutexServer<HubMutex.IHeader> = await HubMutex.master();
      const backend: HubBackend = new HubBackend();

      HubGlobal.mock = options.mock_llm;
      await backend.open();

      // TERMINATE
      closer.value = async (): Promise<void> => {
        await sleep_for(2_500); // WAIT FOR BACKGROUND EVENTS
        await mutex.close();
        await backend.close();
        proxy.kill();
        payment.kill();
      };
    },
    close: async (): Promise<void> => {
      if (closer.value !== null) await closer.value();
    },
    memory: async () => process.memoryUsage(),
  });
};
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
