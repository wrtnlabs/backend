import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioAccountSecretValueController } from "../../base/accounts/StudioAccountSecretValueController";

export class StudioAdminAccountSecretValueController extends StudioAccountSecretValueController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
