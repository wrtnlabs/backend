import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSystematicChannelController } from "../../base/systematic/HubSystematicChannelController";

export class HubSellerSystematicChannelController extends HubSystematicChannelController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
