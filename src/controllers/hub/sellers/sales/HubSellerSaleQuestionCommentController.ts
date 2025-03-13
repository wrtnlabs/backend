import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSaleInquiryCommentWritableController } from "../../base/sales/inquiries/HubSaleInquiryCommentsWritableController";

export class HubSellerSaleQuestionCommentController extends HubSaleInquiryCommentWritableController(
  "questions",
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
