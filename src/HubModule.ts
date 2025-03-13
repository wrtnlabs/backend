import { Module, OnModuleInit } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import "@wrtnlabs/schema";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { LoggerModule } from "nestjs-pino";

import { AdminModule } from "./controllers/admin/AdminModule";
import { HubAdminModule } from "./controllers/hub/admins/HubAdminModule";
import { HubCustomerModule } from "./controllers/hub/customers/HubCustomerModule";
import { HubSellerModule } from "./controllers/hub/sellers/HubSellerModule";
import { MonitorModule } from "./controllers/monitors/MonitorModule";
import { StudioAdminModule } from "./controllers/studio/admins/StudioAdminModule";
import { StudioCustomerModule } from "./controllers/studio/customers/StudioCustomerModule";
import { StudioSellerModule } from "./controllers/studio/sellers/StudioSellerModule";
import { HubStatisticScheduler } from "./scheduler/statistics/HubStatisticScheduler";
import { pinoLoggerParams } from "./utils/LoggingUtil";

export const HubModule = () => {
  @Module({
    imports: [
      ScheduleModule.forRoot(),
      LoggerModule.forRoot({ ...pinoLoggerParams }),
      //----
      // CONTROLLERS
      //----
      // COMMON
      MonitorModule,

      // HUB
      AdminModule,
      HubAdminModule,
      HubCustomerModule,
      HubSellerModule,

      // STUDIO
      StudioAdminModule,
      StudioCustomerModule,
      StudioSellerModule,
    ],
    providers: [HubStatisticScheduler],
    exports: [HubStatisticScheduler],
  })
  class HubModule implements OnModuleInit {
    onModuleInit() {
      dayjs.extend(utc);
      dayjs.extend(timezone);
      dayjs.tz.setDefault("Asia/Seoul");
    }
  }

  return HubModule;
};
