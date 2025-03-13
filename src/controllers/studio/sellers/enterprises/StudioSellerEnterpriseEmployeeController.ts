import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { StudioEnterpriseEmployeeController } from "../../base/enterprises/StudioEnterpriseEmployeeController";

export class StudioSellerEnterpriseEmployeeController extends StudioEnterpriseEmployeeController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
