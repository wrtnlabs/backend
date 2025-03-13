import { Module } from "@nestjs/common";

import { HubAdminCouponController } from "./HubAdminCouponController";

@Module({
  controllers: [HubAdminCouponController],
})
export class HubAdminCouponModule {}
