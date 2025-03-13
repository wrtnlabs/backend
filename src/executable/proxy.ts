import http from "http";
import { SharedLock, SharedMutex, UniqueLock } from "tstl";

import { HubOrderGoodApiProvider } from "../providers/hub/orders/HubOrderGoodApiProvider";

import { HubGlobal } from "../HubGlobal";
import { ErrorUtil } from "../utils/ErrorUtil";

function handle_error(exp: any): void {
  console.log(JSON.stringify(ErrorUtil.serialize(exp)));
}

const main = async (): Promise<void> => {
  process.on("uncaughtException", handle_error);
  process.on("unhandledRejection", handle_error);

  const mutex: SharedMutex = new SharedMutex();
  const server: http.Server = http.createServer(async (request, response) => {
    const acquired: boolean = await SharedLock.try_lock(mutex, async () => {
      try {
        await HubOrderGoodApiProvider.intermediate({ request, response });
      } catch {}
    });
    if (acquired === false) {
      response.writeHead(503, { "Content-Type": "text/plain" });
      response.end(
        "Generative hub server is on updating. Please try it for a second later.",
      );
    }
  });
  server.listen(Number(HubGlobal.env.HUB_PROXY_PORT), "0.0.0.0");

  process.on("SIGTERM", async () => {
    await UniqueLock.lock(mutex, () => close(server));
    process.exit(0);
  });
};

const close = (server: http.Server): Promise<void> =>
  new Promise((resolve) => server.close(resolve as () => void));

main().catch((exp) => {
  handle_error(exp);
  process.exit(-1);
});
