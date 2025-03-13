import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubOrderGoodIssueWritableController } from "../../base/orders/HubOrderGoodIssueWritableController";

export class HubSellerOrderGoodIssueController extends HubOrderGoodIssueWritableController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
