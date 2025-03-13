import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSaleInquiryCommentWritableController } from "../../base/sales/inquiries/HubSaleInquiryCommentsWritableController";

export class HubSellerSaleReviewCommentController extends HubSaleInquiryCommentWritableController(
  "reviews",
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
