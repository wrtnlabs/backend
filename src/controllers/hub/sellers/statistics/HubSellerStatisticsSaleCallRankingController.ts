import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubStatisticsSaleCallRankingController } from "../../base/statistics/HubStatisticsSaleCallRankingController";

export class HubSellerStatisticsSaleCallRankingController extends HubStatisticsSaleCallRankingController(
  {
    AuthGuard: HubSellerAuth,
    path: "sellers",
  },
) {}
