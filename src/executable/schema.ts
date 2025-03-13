import { PrismaClient } from "@prisma/client";

import { HubConfiguration } from "../HubConfiguration";
import { HubGlobal } from "../HubGlobal";
import { HubSetupWizard } from "../setup/HubSetupWizard";

async function execute(
  database: string,
  username: string,
  password: string,
  script: string,
): Promise<void> {
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: `postgresql://${username}:${password}@${HubGlobal.env.HUB_POSTGRES_HOST}:${HubGlobal.env.HUB_POSTGRES_PORT}/${database}`,
        },
      },
    });

    const queries: string[] = script
      .split("\n")
      .map((str) => str.trim())
      .filter((str) => !!str);
    for (const query of queries)
      try {
        await prisma.$executeRawUnsafe(`${query}`);
      } catch {
        await prisma.$disconnect();
      }
    await prisma.$disconnect();
  } catch (err) {
    console.log(err);
  }
}

async function main(): Promise<void> {
  if (HubGlobal.mode === "real")
    throw new Error("This script can't be run in real");

  const config = HubConfiguration.DB_CONFIG();

  const root = {
    account: process.argv[2] ?? "postgres",
    password: process.argv[3] ?? "root",
  };

  await execute(
    "postgres",
    root.account,
    root.password,
    `
        CREATE USER ${config.username} WITH ENCRYPTED PASSWORD '${config.password}';
        ALTER ROLE ${config.username} WITH CREATEDB
        CREATE DATABASE ${config.database} OWNER ${config.username};
    `,
  );

  await execute(
    "postgres",
    root.account,
    root.password,
    `
        CREATE SCHEMA ${config.schema} AUTHORIZATION ${config.username};
    `,
  );

  await execute(
    config.database,
    root.account,
    root.password,
    `
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ${config.schema} TO ${config.username};

        CREATE USER ${config.readonlyUsername} WITH ENCRYPTED PASSWORD '${config.password}';
        GRANT USAGE ON SCHEMA ${config.schema} TO ${config.readonlyUsername};
        GRANT SELECT ON ALL TABLES IN SCHEMA ${config.schema} TO ${config.readonlyUsername};
    `,
  );

  HubGlobal.testing = true;
  await HubSetupWizard.schema();

  console.log("Completed");
}

main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
