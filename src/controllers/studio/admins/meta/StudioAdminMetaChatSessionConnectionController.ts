import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioMetaChatSessionConnectionController } from "../../base/meta/StudioMetaChatSessionConnectionController";

export class StudioAdminMetaChatSessionConnectionController extends StudioMetaChatSessionConnectionController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
