import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubOrderGoodHistoryController } from "../../base/orders/HubOrderGoodHistoryController";

export class HubCustomerOrderGoodHistoryController extends HubOrderGoodHistoryController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
