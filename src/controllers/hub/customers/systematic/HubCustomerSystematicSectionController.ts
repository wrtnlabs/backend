import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubSystematicSectionController } from "../../base/systematic/HubSystematicSectionController";

export class HubCustomerSystematicSectionController extends HubSystematicSectionController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
