import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubCommonAttachmentController } from "../../base/common/HubCommonAttachmentController";

export class HubSellerCommonAttachmentController extends HubCommonAttachmentController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
