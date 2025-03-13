import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioAccountSecretValueController } from "../../base/accounts/StudioAccountSecretValueController";

export class StudioSellerAccountSecretValueController extends StudioAccountSecretValueController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
