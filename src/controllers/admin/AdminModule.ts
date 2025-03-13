import { Module } from "@nestjs/common";

import { AdminCustomerAccessController } from "./AdminCustomerAccessController";
import { AdminCustomerAggregateController } from "./AdminCustomerAggregateController";

@Module({
  controllers: [
    AdminCustomerAccessController,
    AdminCustomerAggregateController,
  ],
})
export class AdminModule {}
