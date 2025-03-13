import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSaleAuditCommentController } from "../../base/sales/HubSaleAuditCommentController";

export class HubSellerSaleAuditCommentController extends HubSaleAuditCommentController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
