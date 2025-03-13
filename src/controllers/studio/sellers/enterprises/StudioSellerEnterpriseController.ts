import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioEnterpriseController } from "../../base/enterprises/StudioEnterpriseController";

export class StudioSellerEnterpriseController extends StudioEnterpriseController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
