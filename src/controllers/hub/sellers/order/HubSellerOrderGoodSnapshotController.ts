import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubOrderGoodSnapshotController } from "../../base/orders/HubOrderGoodSnapshotController";

export class HubSellerOrderGoodSnapshotController extends HubOrderGoodSnapshotController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
