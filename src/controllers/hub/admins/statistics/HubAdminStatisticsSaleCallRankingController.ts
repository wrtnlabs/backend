import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubStatisticsSaleCallRankingController } from "../../base/statistics/HubStatisticsSaleCallRankingController";

export class HubAdminStatisticsSaleCallRankingController extends HubStatisticsSaleCallRankingController(
  {
    AuthGuard: HubAdminAuth,
    path: "admins",
  },
) {}
