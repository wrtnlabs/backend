import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSaleAuditController } from "../../base/sales/HubSaleAuditController";

export class HubSellerSaleAuditController extends HubSaleAuditController({
  path: "sellers",
  AuthGuard: HubSellerAuth,
}) {}
