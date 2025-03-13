import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubOrderGoodIssueCommentReadableController } from "../../base/orders/HubOrderGoodIssueCommentReadableController";

export class HubAdminOrderGoodIssueCommentController extends HubOrderGoodIssueCommentReadableController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
