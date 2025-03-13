import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubOpenApiTranslateController } from "../../base/openapi/HubOpenApiTranslateController";

export class HubAdminOpenApiTranslateController extends HubOpenApiTranslateController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {}
