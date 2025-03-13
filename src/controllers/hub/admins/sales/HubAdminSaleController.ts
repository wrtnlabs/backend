import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSaleController } from "../../base/sales/HubSaleController";

export class HubAdminSaleController extends HubSaleController({
  path: "admins",
  AuthGuard: HubAdminAuth,
}) {}
