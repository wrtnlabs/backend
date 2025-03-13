import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubSaleSnapshotContentController } from "../../base/sales/HubSaleSnapshotContentController";

export class HubCustomerSaleSnapshotContentController extends HubSaleSnapshotContentController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
