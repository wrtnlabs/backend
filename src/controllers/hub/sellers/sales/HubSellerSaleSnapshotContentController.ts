import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSaleSnapshotContentController } from "../../base/sales/HubSaleSnapshotContentController";

export class HubSellerSaleSnapshotContentController extends HubSaleSnapshotContentController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
