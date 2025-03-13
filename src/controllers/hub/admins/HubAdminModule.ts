import { Module } from "@nestjs/common";

import { HubAdminAuthenticateModule } from "./authenticate/HubAdminAuthenticateModule";
import { HubAdminCouponModule } from "./coupons/HubAdminCouponModule";
import { HubAdminDepositModule } from "./deposits/HubAdminDepositModule";
import { HubAdminPushMessageModule } from "./messages/HubAdminPushMessageModule";
import { HubAdminOpenApiModule } from "./openapi/HubAdminOpenApiModule";
import { HubAdminOrderModule } from "./orders/HubAdminOrderModule";
import { HubAdminSaleModule } from "./sales/HubAdminSaleModule";
import { HubAdminStatisticsModule } from "./statistics/HubAdminStatisticsModule";
import { HubAdminSystematicModule } from "./systematic/HubAdminSystematicModule";

@Module({
  imports: [
    HubAdminAuthenticateModule,
    HubAdminCouponModule,
    HubAdminDepositModule,
    HubAdminOpenApiModule,
    HubAdminOrderModule,
    HubAdminPushMessageModule,
    HubAdminSaleModule,
    HubAdminSystematicModule,
    HubAdminStatisticsModule,
  ],
})
export class HubAdminModule {}
