import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSaleQuestionController } from "../../base/sales/inquiries/HubSaleQuestionController";

export class HubAdminSaleQuestionController extends HubSaleQuestionController({
  path: "admins",
  AuthGuard: HubAdminAuth,
}) {}
