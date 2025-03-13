import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubStatisticsOrderGoodCallController } from "../../base/statistics/HubStatisticsOrderGoodCallController";

export class HubCustomerStatisticsOrderGoodCallController extends HubStatisticsOrderGoodCallController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
