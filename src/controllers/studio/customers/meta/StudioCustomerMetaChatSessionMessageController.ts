import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioMetaChatSessionMessageController } from "../../base/meta/StudioMetaChatSessionMessageController";

export class StudioCustomerMetaChatSessionMessageController extends StudioMetaChatSessionMessageController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
