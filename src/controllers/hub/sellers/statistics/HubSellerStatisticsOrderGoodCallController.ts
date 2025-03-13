import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubStatisticsOrderGoodCallController } from "../../base/statistics/HubStatisticsOrderGoodCallController";

export class HubSellerStatisticsOrderGoodCallController extends HubStatisticsOrderGoodCallController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
