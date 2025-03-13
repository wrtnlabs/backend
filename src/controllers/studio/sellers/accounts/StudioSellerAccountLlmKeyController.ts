import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioAccountLlmKeyController } from "../../base/accounts/StudioAccountLlmKeyController";

export class StudioSellerAccountLlmKeyController extends StudioAccountLlmKeyController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
