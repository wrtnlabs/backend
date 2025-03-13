import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioMetaChatSessionShareController } from "../../base/meta/StudioMetaChatSessionShareController";

export class StudioAdminMetaChatSessionShareController extends StudioMetaChatSessionShareController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
