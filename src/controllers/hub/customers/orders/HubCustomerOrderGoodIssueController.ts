import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubOrderGoodIssueWritableController } from "../../base/orders/HubOrderGoodIssueWritableController";

export class HubCustomerOrderGoodIssueController extends HubOrderGoodIssueWritableController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
