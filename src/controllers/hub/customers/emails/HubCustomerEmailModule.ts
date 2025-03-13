import { Module } from "@nestjs/common";

import { HubCustomerEmailVerificationController } from "./HubCustomerEmailVerificationController";

@Module({
  controllers: [HubCustomerEmailVerificationController],
})
export class HubCustomerEmailModule {}
