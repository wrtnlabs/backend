import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubPushMessageHistoryController } from "../../base/messages/HubPushMessageHistoryController";

export class HubAdminPushMessageHistoryController extends HubPushMessageHistoryController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
