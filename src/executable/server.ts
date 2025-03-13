import cp from "child_process";

import { HubBackend } from "../HubBackend";
import { HubGlobal } from "../HubGlobal";
import { PaymentSetupWizard } from "../setup/PaymentSetupWizard";
import { ErrorUtil } from "../utils/ErrorUtil";

const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js") require("source-map-support/register");

function handle_error(exp: any): void {
  console.error(JSON.stringify(ErrorUtil.serialize(exp)));
}

async function main(): Promise<void> {
  process.on("uncaughtException", handle_error);
  process.on("unhandledRejection", handle_error);

  // BACKEND SEVER LATER
  const backend: HubBackend = new HubBackend();
  await backend.open();

  const children: cp.ChildProcess[] = [];
  if (
    HubGlobal.mode === "local" &&
    false === process.argv.includes("--no-others")
  )
    children.push(
      await PaymentSetupWizard.start(),
      cp.fork(__dirname + "/proxy.js", { stdio: "inherit" }),
    );

  // POST-PROCESSES
  process.send?.("ready");
  process.on("SIGTERM", async () => {
    for (const child of children) child.kill();
    await backend.close();
    process.exit(0);
  });
}
main().catch((exp) => {
  handle_error(exp);
  process.exit(-1);
});
