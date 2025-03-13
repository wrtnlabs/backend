import { setupServer } from "msw/node";
import { Singleton } from "tstl";

import { handlers } from "./handlers";

/**
 * You must use `mswServer.get()` before writing the main test logic using msw.
 */
export const mswServer = new Singleton(() => {
  const server = setupServer(...handlers);

  server.listen({ onUnhandledRequest: "bypass" });

  return server;
});
