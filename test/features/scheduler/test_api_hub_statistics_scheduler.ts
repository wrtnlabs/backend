// import { PrismaClient } from "@prisma/client";
// import { CronJob } from "cron";
// import fs from "fs";
// import path from "path";
//
// import { HubConfiguration } from "../../../src/HubConfiguration";
// import { Scheduler } from "../../../src/scheduler/statistics/scheduler";
//
// export const test_api_hub_statistics_scheduler = async () => {
//   const prisma = new PrismaClient();
//
//   const scheduler = new Scheduler();
//
//   const directory = `${HubConfiguration.ROOT}/src/setup/views`;
//
//   new CronJob("*/1 * * * * *", async function () {
//     try {
//       await scheduler.statisticsScheduler();
//
//       for (const file of await fs.promises.readdir(directory)) {
//         if (!file.endsWith(".sql")) continue;
//
//         const viewName = path.basename(file, ".sql");
//         const data = await prisma.$queryRawUnsafe(`SELECT *
//                                                            FROM ${viewName};`);
//
//         console.log(`Data of ${viewName}:`, data);
//       }
//     } catch (err) {
//       console.error("Test failed:", err);
//     } finally {
//       await prisma.$disconnect();
//     }
//   });
// };
