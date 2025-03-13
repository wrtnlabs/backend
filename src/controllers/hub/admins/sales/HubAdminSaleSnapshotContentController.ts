import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSaleSnapshotContentController } from "../../base/sales/HubSaleSnapshotContentController";

export class HubAdminSaleSnapshotContentController extends HubSaleSnapshotContentController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
