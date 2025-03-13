import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubCommonTranslateController } from "../../base/common/HubCommonTranslateController";

export class HubCustomerCommonTranslateController extends HubCommonTranslateController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
