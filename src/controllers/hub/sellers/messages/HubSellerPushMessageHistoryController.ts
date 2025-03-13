import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubPushMessageHistoryController } from "../../base/messages/HubPushMessageHistoryController";

export class HubSellerPushMessageHistoryController extends HubPushMessageHistoryController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
