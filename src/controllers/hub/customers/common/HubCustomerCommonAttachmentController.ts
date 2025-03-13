import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubCommonAttachmentController } from "../../base/common/HubCommonAttachmentController";

export class HubCustomerCommonAttachmentController extends HubCommonAttachmentController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
