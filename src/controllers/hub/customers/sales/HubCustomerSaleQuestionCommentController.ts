import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubSaleInquiryCommentWritableController } from "../../base/sales/inquiries/HubSaleInquiryCommentsWritableController";

export class HubCustomerSaleQuestionCommentController extends HubSaleInquiryCommentWritableController(
  "questions",
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
