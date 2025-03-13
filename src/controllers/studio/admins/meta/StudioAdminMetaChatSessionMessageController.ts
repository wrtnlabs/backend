import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioMetaChatSessionMessageController } from "../../base/meta/StudioMetaChatSessionMessageController";

export class StudioAdminMetaChatSessionMessageController extends StudioMetaChatSessionMessageController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
