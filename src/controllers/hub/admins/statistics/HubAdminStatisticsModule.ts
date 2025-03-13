import { Module } from "@nestjs/common";

import { HubAdminStatisticsOrderGoodCallController } from "./HubAdminStatisticsOrderGoodCallController";
import { HubAdminStatisticsSaleCallRankingController } from "./HubAdminStatisticsSaleCallRankingController";

@Module({
  controllers: [
    HubAdminStatisticsOrderGoodCallController,
    HubAdminStatisticsSaleCallRankingController,
  ],
})
export class HubAdminStatisticsModule {}
