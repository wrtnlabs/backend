import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubStatisticsOrderGoodCallController } from "../../base/statistics/HubStatisticsOrderGoodCallController";

export class HubAdminStatisticsOrderGoodCallController extends HubStatisticsOrderGoodCallController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
