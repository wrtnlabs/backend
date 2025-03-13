import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubOrderGoodIssueCommentWritableController } from "../../base/orders/HubOrderGoodIssueCommentWritableController";

export class HubSellerOrderGoodIssueCommentController extends HubOrderGoodIssueCommentWritableController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
