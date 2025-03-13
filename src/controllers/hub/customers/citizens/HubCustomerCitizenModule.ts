import { Module } from "@nestjs/common";

import { HubCustomerCitizenController } from "./HubCustomerCitizenController";

@Module({
  controllers: [HubCustomerCitizenController],
})
export class HubCustomerCitizenModule {}
