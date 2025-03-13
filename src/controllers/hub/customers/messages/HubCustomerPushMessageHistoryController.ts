import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubPushMessageHistoryController } from "../../base/messages/HubPushMessageHistoryController";

export class HubCustomerPushMessageHistoryController extends HubPushMessageHistoryController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
