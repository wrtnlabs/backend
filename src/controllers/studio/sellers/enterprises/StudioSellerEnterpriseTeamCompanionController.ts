import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioEnterpriseTeamCompanionController } from "../../base/enterprises/StudioEnterpriseTeamCompanionController";

export class StudioSellerEnterpriseTeamCompanionController extends StudioEnterpriseTeamCompanionController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
