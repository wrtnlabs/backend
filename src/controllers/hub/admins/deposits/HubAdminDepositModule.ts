import { Module } from "@nestjs/common";

import { HubAdminDepositController } from "./HubAdminDepositController";
import { HubAdminDepositDonationController } from "./HubAdminDepositDonationController";

@Module({
  controllers: [HubAdminDepositDonationController, HubAdminDepositController],
})
export class HubAdminDepositModule {}
