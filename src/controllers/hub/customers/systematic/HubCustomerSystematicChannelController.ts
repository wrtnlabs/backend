import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubSystematicChannelController } from "../../base/systematic/HubSystematicChannelController";

export class HubCustomerSystematicChannelController extends HubSystematicChannelController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
