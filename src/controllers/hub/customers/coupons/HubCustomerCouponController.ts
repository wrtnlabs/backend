import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubCouponReadableController } from "../../base/coupons/HubCouponReadableController";

export class HubCustomerCouponController extends HubCouponReadableController({
  path: "customers",
  AuthGuard: HubCustomerAuth,
}) {}
