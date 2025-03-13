import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSystematicChannelCategoryController } from "../../base/systematic/HubSystematicChannelCategoryController";

export class HubSellerSystematicChannelCategoryController extends HubSystematicChannelCategoryController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
