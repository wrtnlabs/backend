import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubSaleSnapshotController } from "../../base/sales/HubSaleSnapshotController";

export class HubCustomerSaleSnapshotController extends HubSaleSnapshotController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
