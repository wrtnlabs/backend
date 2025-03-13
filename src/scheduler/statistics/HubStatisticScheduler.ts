import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import fs from "fs";
import { MutexConnector, RemoteMutex } from "mutex-server";
import { PinoLogger } from "nestjs-pino";
import path from "path";

import { HubConfiguration } from "../../HubConfiguration";
import { HubGlobal } from "../../HubGlobal";

@Injectable()
export class HubStatisticScheduler {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(this.constructor.name);
  }

  @Cron(CronExpression.EVERY_5_MINUTES, {
    timeZone: "Asia/Seoul",
  })
  async statisticsScheduler() {
    try {
      if (acquired === false) {
        const connector: MutexConnector<any> = await HubGlobal.mutex.get();
        const mutex: RemoteMutex = await connector.getMutex(
          this.constructor.name,
        );
        if (false === (await mutex.try_lock_for(2 * 60_000))) return;
        acquired = true;
      }

      const directory = `${HubConfiguration.ROOT}/src/setup/views`;

      for (const file of await fs.promises.readdir(directory)) {
        if (!file.endsWith(".sql")) continue;

        const filenameWithoutExtension = path.basename(file, ".sql");

        await HubGlobal.prisma.$executeRawUnsafe(
          `REFRESH MATERIALIZED VIEW CONCURRENTLY hub.${filenameWithoutExtension};`,
        );
      }

      this.logger.info("Refreshed materialized view");
    } catch (err) {
      this.logger.error({
        message: "Failed to refresh materialized view",
        err: err,
      });
    }
  }
}

// disable-eslint-next-line
let acquired: boolean = false;
