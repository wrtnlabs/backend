import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubSystematicChannelCategoryController } from "../../base/systematic/HubSystematicChannelCategoryController";

export class HubCustomerSystematicChannelCategoryController extends HubSystematicChannelCategoryController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
