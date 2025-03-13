import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubOrderController } from "../../base/orders/HubOrderController";

export class HubAdminOrderController extends HubOrderController({
  path: "admins",
  AuthGuard: HubAdminAuth,
}) {}
