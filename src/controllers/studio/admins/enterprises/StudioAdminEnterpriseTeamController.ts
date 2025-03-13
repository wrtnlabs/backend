import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioEnterpriseTeamController } from "../../base/enterprises/StudioEnterpriseTeamController";

export class StudioAdminEnterpriseTeamController extends StudioEnterpriseTeamController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
