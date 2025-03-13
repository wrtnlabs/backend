import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioAccountController } from "../../base/accounts/StudioAccountController";

export class StudioSellerAccountController extends StudioAccountController({
  path: "sellers",
  AuthGuard: HubSellerAuth,
}) {}
