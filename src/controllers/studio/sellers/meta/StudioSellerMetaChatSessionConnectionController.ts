import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioMetaChatSessionConnectionController } from "../../base/meta/StudioMetaChatSessionConnectionController";

export class StudioSellerMetaChatSessionConnectionController extends StudioMetaChatSessionConnectionController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
