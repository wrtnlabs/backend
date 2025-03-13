import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioMetaChatSessionShareMessageController } from "../../base/meta/StudioMetaChatSessionShareMessageController";

export class StudioSellerMetaChatsessionShareMessageController extends StudioMetaChatSessionShareMessageController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
