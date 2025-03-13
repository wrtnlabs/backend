import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSaleInquiryCommentReadableController } from "../../base/sales/inquiries/HubSaleInquiryCommentReadableController";

export class HubAdminSaleQuestionCommentController extends HubSaleInquiryCommentReadableController(
  "questions",
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
