import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubOpenApiTranslateController } from "../../base/openapi/HubOpenApiTranslateController";

export class HubSellerOpenApiTranslateController extends HubOpenApiTranslateController(
  {
    path: "sellers",
    AuthGuard: HubSellerAuth,
  },
) {}
