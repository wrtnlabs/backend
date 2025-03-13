import { Module } from "@nestjs/common";

import { HubSellerStatisticsOrderGoodCallController } from "./HubSellerStatisticsOrderGoodCallController";
import { HubSellerStatisticsSaleCallRankingController } from "./HubSellerStatisticsSaleCallRankingController";

@Module({
  controllers: [
    HubSellerStatisticsOrderGoodCallController,
    HubSellerStatisticsSaleCallRankingController,
  ],
})
export class HubSellerStatisticsModule {}
