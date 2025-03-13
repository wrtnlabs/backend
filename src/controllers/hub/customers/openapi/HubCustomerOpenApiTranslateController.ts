import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubOpenApiTranslateController } from "../../base/openapi/HubOpenApiTranslateController";

export class HubCustomerOpenApiTranslateController extends HubOpenApiTranslateController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
