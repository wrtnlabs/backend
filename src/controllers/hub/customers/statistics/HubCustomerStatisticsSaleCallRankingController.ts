import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubStatisticsSaleCallRankingController } from "../../base/statistics/HubStatisticsSaleCallRankingController";

export class HubCustomerStatisticsSaleCallRankingController extends HubStatisticsSaleCallRankingController(
  {
    AuthGuard: HubCustomerAuth,
    path: "customers",
  },
) {}
