import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioAccountSecretController } from "../../base/accounts/StudioAccountSecretController";

export class StudioAdminAccountSecretController extends StudioAccountSecretController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
