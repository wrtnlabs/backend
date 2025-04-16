import cp from "child_process";
import { MutexServer } from "mutex-server";

import { HubBackend } from "../src/HubBackend";
import { HubMutex } from "../src/HubMutex";
import { PaymentSetupWizard } from "../src/setup/PaymentSetupWizard";
import { TestAutomation } from "./TestAutomation";

interface IBackend {
  main: HubBackend;
  mutex: MutexServer<HubMutex.IHeader>;
  payment: cp.ChildProcess;
  proxy: cp.ChildProcess;
}

const main = async (): Promise<void> => {
  await TestAutomation.execute<IBackend>({
    open: async () => {
      const mutex: MutexServer<HubMutex.IHeader> = await HubMutex.master();
      const proxy: cp.ChildProcess = cp.fork(
        `${__dirname}/../src/executable/proxy.js`,
        {
          stdio: "inherit",
        },
      );
      const payment: cp.ChildProcess = await PaymentSetupWizard.start();
      const main: HubBackend = new HubBackend();
      await main.open();

      return {
        main,
        mutex,
        payment,
        proxy,
      } satisfies IBackend;
    },
    close: async (backend: IBackend) => {
      await backend.main.close();
      await backend.mutex.close();
      backend.payment.kill();
      backend.proxy.kill();
    },
  });
};

main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
