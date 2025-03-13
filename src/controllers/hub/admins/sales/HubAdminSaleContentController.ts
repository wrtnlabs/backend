import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSaleContentController } from "../../base/sales/HubSaleContentController";

export class HubAdminSaleContentController extends HubSaleContentController({
  path: "admins",
  AuthGuard: HubAdminAuth,
}) {}
