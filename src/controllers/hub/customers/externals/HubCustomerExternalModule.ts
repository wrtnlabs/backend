import { Module } from "@nestjs/common";

import { HubCustomerExternalController } from "./HubCustomerExternalController";

@Module({
  controllers: [HubCustomerExternalController],
})
export class HubCustomerExternalModule {}
