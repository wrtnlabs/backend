import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioMetaChatSessionController } from "../../base/meta/StudioMetaChatSessionController";

export class StudioSellerMetaChatSessionController extends StudioMetaChatSessionController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
