import { Module } from "@nestjs/common";

import { HubSellerCouponController } from "./HubSellerCouponController";

@Module({
  controllers: [HubSellerCouponController],
})
export class HubSellerCouponModule {}
