import core from "@nestia/core";
import { tags } from "typia";

import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";

import { HubCouponProvider } from "../../../../providers/hub/coupons/HubCouponProvider";

import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubCouponWritableController } from "../../base/coupons/HubCouponsWritableController";

export class HubAdminCouponController extends HubCouponWritableController({
  path: "admins",
  AuthGuard: HubAdminAuth,
}) {
  /**
   *  @internal
   */
  @core.TypedRoute.Delete(":id/destroy")
  public destroy(
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubCouponProvider.destroy({
      admin,
      id,
    });
  }
}
