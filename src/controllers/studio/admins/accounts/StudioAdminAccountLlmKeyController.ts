import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioAccountLlmKeyController } from "../../base/accounts/StudioAccountLlmKeyController";

export class StudioAdminAccountLlmKeyController extends StudioAccountLlmKeyController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
