import { HubCustomerAuth } from "../../../../../decorators/HubCustomerAuth";
import { HubSaleInquiryLikeController } from "../../../base/sales/inquiries/likes/HubSaleInquiryLikeController";

export class HubCustomerSaleInquiryLikeController extends HubSaleInquiryLikeController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
