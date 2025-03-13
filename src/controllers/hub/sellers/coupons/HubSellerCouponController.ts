import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubCouponWritableController } from "../../base/coupons/HubCouponsWritableController";

export class HubSellerCouponController extends HubCouponWritableController({
  path: "sellers",
  AuthGuard: HubSellerAuth,
}) {}
