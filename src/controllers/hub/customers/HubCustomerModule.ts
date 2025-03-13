import { Module } from "@nestjs/common";

import { HubCustomerAuthenticateModule } from "./authenticate/HubCustomerAuthenticateModule";
import { HubCustomerCitizenModule } from "./citizens/HubCustomerCitizenModule";
import { HubCustomerCommonModule } from "./common/HubCustomerCommonModule";
import { HubCustomerCouponModule } from "./coupons/HubCustomerCouponModule";
import { HubCustomerDepositModule } from "./deposits/HubCustomerDepositModule";
import { HubCustomerEmailModule } from "./emails/HubCustomerEmailModule";
import { HubCustomerExternalModule } from "./externals/HubCustomerExternalModule";
import { HubCustomerMemberModule } from "./members/HubCustomerMemberModule";
import { HubCustomerPushMessageModule } from "./messages/HubCustomerPushMessageModule";
import { HubCustomerOpenApiModule } from "./openapi/HubCustomerOpenApiModule";
import { HunCustomerOrderModule } from "./orders/HubCustomerOrderModule";
import { HubCustomerSaleModule } from "./sales/HubCustomerSaleModule";
import { HubCustomerStatisticsModule } from "./statistics/HubCustomerStatisticsModule";
import { HubCustomerSystematicModule } from "./systematic/HubCustomerSystematicModule";

@Module({
  imports: [
    HubCustomerAuthenticateModule,
    HubCustomerCommonModule,
    HubCustomerCouponModule,
    HubCustomerDepositModule,
    HubCustomerOpenApiModule,
    HunCustomerOrderModule,
    HubCustomerPushMessageModule,
    HubCustomerSaleModule,
    HubCustomerStatisticsModule,
    HubCustomerSystematicModule,
    HubCustomerMemberModule,
    HubCustomerExternalModule,
    HubCustomerCitizenModule,
    HubCustomerEmailModule,
  ],
})
export class HubCustomerModule {}
