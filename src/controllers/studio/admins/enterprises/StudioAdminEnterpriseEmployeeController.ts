import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioEnterpriseEmployeeController } from "../../base/enterprises/StudioEnterpriseEmployeeController";

export class StudioAdminEnterpriseEmployeeController extends StudioEnterpriseEmployeeController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
