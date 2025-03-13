import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubOrderController } from "../../base/orders/HubOrderController";

export class HubSellerOrderController extends HubOrderController({
  path: "sellers",
  AuthGuard: HubSellerAuth,
}) {}
