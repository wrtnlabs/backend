import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubSaleInquiryCommentWritableController } from "../../base/sales/inquiries/HubSaleInquiryCommentsWritableController";

export class HubCustomerSaleReviewCommentController extends HubSaleInquiryCommentWritableController(
  "reviews",
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
