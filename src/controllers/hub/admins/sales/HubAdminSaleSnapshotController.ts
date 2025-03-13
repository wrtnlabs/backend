import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSaleSnapshotController } from "../../base/sales/HubSaleSnapshotController";

export class HubAdminSaleSnapshotController extends HubSaleSnapshotController({
  path: "admins",
  AuthGuard: HubAdminAuth,
}) {}
