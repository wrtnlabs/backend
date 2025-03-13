import { Module } from "@nestjs/common";

import { HubAdminPushMessageController } from "./HubAdminPushMessageController";
import { HubAdminPushMessageHistoryController } from "./HubAdminPushMessageHistoryController";

@Module({
  controllers: [
    HubAdminPushMessageController,
    HubAdminPushMessageHistoryController,
  ],
})
export class HubAdminPushMessageModule {}
