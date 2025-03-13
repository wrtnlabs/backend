import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubOrderGoodSnapshotController } from "../../base/orders/HubOrderGoodSnapshotController";

export class HubAdminOrderGoodSnapshotController extends HubOrderGoodSnapshotController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
