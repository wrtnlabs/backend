import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioMetaChatSessionMessageController } from "../../base/meta/StudioMetaChatSessionMessageController";

export class StudioSellerMetaChatSessionMessageController extends StudioMetaChatSessionMessageController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
