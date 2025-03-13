import { Module } from "@nestjs/common";

import { HubCustomerPushMessageController } from "./HubCustomerPushMessageController";
import { HubCustomerPushMessageHistoryController } from "./HubCustomerPushMessageHistoryController";

@Module({
  controllers: [
    HubCustomerPushMessageController,
    HubCustomerPushMessageHistoryController,
  ],
})
export class HubCustomerPushMessageModule {}
