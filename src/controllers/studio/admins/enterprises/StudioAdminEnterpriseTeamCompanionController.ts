import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioEnterpriseTeamCompanionController } from "../../base/enterprises/StudioEnterpriseTeamCompanionController";

export class StudioAdminEnterpriseTeamCompanionController extends StudioEnterpriseTeamCompanionController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
