import { HubCustomerAuth } from "../../../../../decorators/HubCustomerAuth";
import { HubSaleRecommendController } from "../../../base/sales/recommend/HubSaleRecommendController";

export class HubCustomerSaleRecommendController extends HubSaleRecommendController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {}
