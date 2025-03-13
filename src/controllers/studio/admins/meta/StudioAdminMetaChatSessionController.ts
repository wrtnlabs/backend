import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioMetaChatSessionController } from "../../base/meta/StudioMetaChatSessionController";

export class StudioAdminMetaChatSessionController extends StudioMetaChatSessionController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
