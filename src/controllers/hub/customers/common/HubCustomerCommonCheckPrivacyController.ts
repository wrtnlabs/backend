import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubCommonCheckPrivacyController } from "../../base/common/HubCommonCheckPrivacyController";

export class HubCustomerCommonCheckPrivacyController extends HubCommonCheckPrivacyController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
