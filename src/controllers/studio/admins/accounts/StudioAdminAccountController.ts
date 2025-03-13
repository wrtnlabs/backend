import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioAccountController } from "../../base/accounts/StudioAccountController";

export class StudioAdminAccountController extends StudioAccountController({
  path: "admins",
  AuthGuard: HubAdminAuth,
}) {}
