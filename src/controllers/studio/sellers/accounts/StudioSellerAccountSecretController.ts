import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioAccountSecretController } from "../../base/accounts/StudioAccountSecretController";

export class StudioSellerAccountSecretController extends StudioAccountSecretController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
