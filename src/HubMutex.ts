import { MutexConnector, MutexServer } from "mutex-server";
import { sleep_for } from "tstl";

import { HubGlobal } from "./HubGlobal";

export namespace HubMutex {
  export interface IHeader {
    "x-wrtn-password": string;
  }

  export const master = async (): Promise<MutexServer<HubMutex.IHeader>> => {
    const server: MutexServer<HubMutex.IHeader> = new MutexServer();
    await server.open(
      Number(HubGlobal.env.HUB_MUTEX_PORT),
      async (acceptor) => {
        if (
          acceptor.header?.["x-wrtn-password"] !==
          HubGlobal.env.HUB_MUTEX_PASSWORD
        )
          await acceptor.reject();
        else await acceptor.accept();
      },
    );
    return server;
  };

  export const slave = async (options?: {
    host?: string;
  }): Promise<MutexConnector<HubMutex.IHeader>> => {
    const connector: MutexConnector<HubMutex.IHeader> = new MutexConnector({
      "x-wrtn-password": HubGlobal.env.HUB_MUTEX_PASSWORD,
    });
    const connect = async () => {
      try {
        await connector.connect(
          HubGlobal.env.HUB_MODE === "local"
            ? `ws://${options?.host ?? HubGlobal.env.HUB_MASTER_IP}:${
                HubGlobal.env.HUB_MUTEX_PORT
              }/mutex`
            : `ws://${options?.host ?? HubGlobal.env.HUB_MASTER_IP}/mutex`,
        );
      } catch {}
    };
    await connect();
    (async () => {
      while (true) {
        try {
          await connector.join();
        } catch {}
        await connect();
        await sleep_for(10_000);
      }
    })().catch(() => {});
    return connector;
  };
}
