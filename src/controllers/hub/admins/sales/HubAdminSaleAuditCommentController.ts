import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSaleAuditCommentController } from "../../base/sales/HubSaleAuditCommentController";

export class HubAdminSaleAuditCommentController extends HubSaleAuditCommentController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
