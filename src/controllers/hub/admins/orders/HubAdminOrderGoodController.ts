import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubOrderGoodController } from "../../base/orders/HubOrderGoodController";

export class HubAdminOrderGoodController extends HubOrderGoodController({
  path: "admins",
  AuthGuard: HubAdminAuth,
}) {}
