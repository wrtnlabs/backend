import { Module } from "@nestjs/common";

import { HubCustomerCouponController } from "./HubCustomerCouponController";
import { HubCustomerCouponTicketController } from "./HubCustomerCouponTicketController";

@Module({
  controllers: [HubCustomerCouponController, HubCustomerCouponTicketController],
})
export class HubCustomerCouponModule {}
