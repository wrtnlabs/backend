import { Module } from "@nestjs/common";

import { HubCustomerDepositChargeController } from "./HubCustomerDepositChargeController";
import { HubCustomerDepositHistoryController } from "./HubCustomerDepositHistoryController";

@Module({
  controllers: [
    HubCustomerDepositChargeController,
    HubCustomerDepositHistoryController,
  ],
})
export class HubCustomerDepositModule {}
