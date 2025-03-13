import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSaleInquiryCommentReadableController } from "../../base/sales/inquiries/HubSaleInquiryCommentReadableController";

export class HubAdminSaleReviewCommentController extends HubSaleInquiryCommentReadableController(
  "reviews",
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
