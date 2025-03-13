import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSaleSnapshotAuditController } from "../../base/sales/HubSaleSnapshotAuditController";

export class HubAdminSaleSnapshotAuditController extends HubSaleSnapshotAuditController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
