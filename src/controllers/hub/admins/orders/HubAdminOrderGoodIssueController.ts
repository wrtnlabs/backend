import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubOrderGoodIssueReadableController } from "../../base/orders/HubOrderGoodIssueReadableController";

export class HubAdminOrderGoodIssueController extends HubOrderGoodIssueReadableController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
