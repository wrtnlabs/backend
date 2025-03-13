import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubOrderGoodController } from "../../base/orders/HubOrderGoodController";

export class HubSellerOrderGoodController extends HubOrderGoodController({
  path: "sellers",
  AuthGuard: HubSellerAuth,
}) {}
