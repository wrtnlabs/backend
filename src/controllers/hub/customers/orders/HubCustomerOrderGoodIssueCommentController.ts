import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubOrderGoodIssueCommentWritableController } from "../../base/orders/HubOrderGoodIssueCommentWritableController";

export class HubCustomerOrderGoodIssueCommentController extends HubOrderGoodIssueCommentWritableController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
