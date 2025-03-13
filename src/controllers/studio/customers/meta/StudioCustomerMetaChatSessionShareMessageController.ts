import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioMetaChatSessionShareMessageController } from "../../base/meta/StudioMetaChatSessionShareMessageController";

export class StudioCustomerMetaChatSessionShareMessageController extends StudioMetaChatSessionShareMessageController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
