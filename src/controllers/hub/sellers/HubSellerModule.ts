import { Module } from "@nestjs/common";

import { HubSellerAuthenticateModule } from "./authenticate/HubSellerAuthenticateModule";
import { HubSellerCommonModule } from "./common/HubSellerCommonModule";
import { HubSellerCouponModule } from "./coupons/HubSellerCouponModule";
import { HubSellerPushMessageModule } from "./messages/HubAdminPushMessageModule";
import { HubSellerOpenApiModule } from "./openapi/HubSellerOpenApiModule";
import { HubSellerOrderModule } from "./order/HubSellerOrderModule";
import { HubSellerSaleModule } from "./sales/HubSellerSaleModule";
import { HubSellerStatisticsModule } from "./statistics/HubSellerStatisticsModule";
import { HubSellerSystematicModule } from "./systematic/HubSellerSystematicModule";

@Module({
  imports: [
    HubSellerAuthenticateModule,
    HubSellerCommonModule,
    HubSellerCouponModule,
    HubSellerPushMessageModule,
    HubSellerOpenApiModule,
    HubSellerOrderModule,
    HubSellerSaleModule,
    HubSellerStatisticsModule,
    HubSellerSystematicModule,
  ],
})
export class HubSellerModule {}
