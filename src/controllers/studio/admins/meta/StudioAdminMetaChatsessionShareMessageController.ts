import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioMetaChatSessionShareMessageController } from "../../base/meta/StudioMetaChatSessionShareMessageController";

export class StudioAdminMetaChatsessionShareMessageController extends StudioMetaChatSessionShareMessageController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
