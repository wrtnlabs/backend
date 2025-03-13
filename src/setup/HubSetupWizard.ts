import cp from "child_process";
import fs from "fs";

import { HubConfiguration } from "../HubConfiguration";
import { HubGlobal } from "../HubGlobal";
import { HubAdministratorSeeder } from "./seeders/HubAdministratorSeeder";
import { HubChannelSeeder } from "./seeders/HubChannelSeeder";
import { HubDepositSeeder } from "./seeders/HubDepositSeeder";
import { HubPushMessageSeeder } from "./seeders/HubPushMessageSeeder";
import { HubSaleSeeder } from "./seeders/HubSaleSeeder";
import { HubSectionSeeder } from "./seeders/HubSectionSeeder";

export namespace HubSetupWizard {
  export const schema = async (): Promise<void> => {
    if (HubGlobal.testing === false) return;

    const execute = (type: string) => (argv: string) =>
      cp.execSync(`npx prisma migrate ${type} --schema=prisma/schema ${argv}`, {
        stdio: "inherit",
        cwd: HubConfiguration.ROOT,
      });
    try {
      await fs.promises.rm(`${HubConfiguration.ROOT}/prisma/migrations`, {
        recursive: true,
      });
    } catch {}
    execute("reset")("--force");
    execute("dev")("--name init");
    await view();
  };

  export const seed = async (): Promise<void> => {
    for (const modulo of [
      HubChannelSeeder,
      HubSectionSeeder,
      HubDepositSeeder,
      HubAdministratorSeeder,
      HubPushMessageSeeder,
      HubSaleSeeder,
    ]) {
      await modulo.seed();
    }
  };

  export const view = async (): Promise<void> => {
    const directory = `${HubConfiguration.ROOT}/src/setup/views`;
    const files = await fs.promises.readdir(directory);

    for (const file of files) {
      if (!file.endsWith(".sql")) continue;
      await executeSqlFile(directory, file);
    }
  };

  const executeSqlFile = async (
    directory: string,
    file: string,
  ): Promise<void> => {
    const content: string = await fs.promises.readFile(
      `${directory}/${file}`,
      "utf-8",
    );
    for (const sql of content.split(";")) {
      if (sql.trim().length > 0) {
        try {
          await HubGlobal.prisma.$executeRawUnsafe(sql);
        } catch {
          console.log("Failed", sql);
        }
      }
    }
  };
}
