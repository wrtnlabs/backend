import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSystematicSectionController } from "../../base/systematic/HubSystematicSectionController";

export class HubSellerSystematicSectionController extends HubSystematicSectionController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
