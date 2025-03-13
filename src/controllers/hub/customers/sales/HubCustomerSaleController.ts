import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubSaleController } from "../../base/sales/HubSaleController";

export class HubCustomerSaleController extends HubSaleController({
  path: "customers",
  AuthGuard: HubCustomerAuth,
}) {}
