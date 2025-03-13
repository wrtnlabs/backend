import { HubMutex } from "../HubMutex";
import { ErrorUtil } from "../utils/ErrorUtil";

function handle_error(exp: any): void {
  console.log(JSON.stringify(ErrorUtil.serialize(exp)));
}

const main = async () => {
  process.on("uncaughtException", handle_error);
  process.on("unhandledRejection", handle_error);
  await HubMutex.master();
};
main().catch((exp) => {
  handle_error(exp);
  process.exit(-1);
});
