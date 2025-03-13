import fs from "fs";
import path from "path";

import { HubConfiguration } from "../HubConfiguration";
import { HubGlobal } from "../HubGlobal";

const main = async () => {
  const directory = `${HubConfiguration.ROOT}/src/setup/views`;
  for (const file of await fs.promises.readdir(directory)) {
    if (!file.endsWith(".sql")) continue;

    const filenameWithoutExtension = path.basename(file, ".sql");

    await HubGlobal.prisma.$executeRawUnsafe(
      `REFRESH MATERIALIZED VIEW CONCURRENTLY hub.${filenameWithoutExtension};`,
    );
  }
};

main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
