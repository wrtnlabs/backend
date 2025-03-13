import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioMetaChatSessionShareController } from "../../base/meta/StudioMetaChatSessionShareController";

export class StudioSellerMetaChatSessionShareController extends StudioMetaChatSessionShareController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
