import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioEnterpriseTeamController } from "../../base/enterprises/StudioEnterpriseTeamController";

export class StudioSellerEnterpriseTeamController extends StudioEnterpriseTeamController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
