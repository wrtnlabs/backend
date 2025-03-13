import { Module } from "@nestjs/common";

import { HubSellerPushMessageHistoryController } from "./HubSellerPushMessageHistoryController";
import { HubSellerPushMessasgeController } from "./HubSellerPushMessasgeController";

@Module({
  controllers: [
    HubSellerPushMessasgeController,
    HubSellerPushMessageHistoryController,
  ],
})
export class HubSellerPushMessageModule {}
