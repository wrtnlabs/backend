import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSaleReviewController } from "../../base/sales/inquiries/HubSaleReviewController";

export class HubAdminSaleReviewController extends HubSaleReviewController({
  path: "admins",
  AuthGuard: HubAdminAuth,
}) {}
