import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubSaleContentController } from "../../base/sales/HubSaleContentController";

export class HubCustomerSaleContentController extends HubSaleContentController({
  path: "customers",
  AuthGuard: HubCustomerAuth,
}) {}
