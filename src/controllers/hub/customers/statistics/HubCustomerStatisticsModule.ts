import { Module } from "@nestjs/common";

import { HubCustomerStatisticsOrderGoodCallController } from "./HubCustomerStatisticsOrderGoodCallController";
import { HubCustomerStatisticsSaleCallRankingController } from "./HubCustomerStatisticsSaleCallRankingController";

@Module({
  controllers: [
    HubCustomerStatisticsOrderGoodCallController,
    HubCustomerStatisticsSaleCallRankingController,
  ],
})
export class HubCustomerStatisticsModule {}
