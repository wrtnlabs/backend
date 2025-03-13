import core from "@nestia/core";
import { tags } from "typia";

import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";

import { HubCouponProvider } from "../../../../providers/hub/coupons/HubCouponProvider";

import { IHubControllerProps } from "../IHubControllerProps";
import { HubCouponReadableController } from "./HubCouponReadableController";

export function HubCouponWritableController<
  Actor extends IHubAdministrator.IInvert | IHubSeller.IInvert,
>(props: IHubControllerProps<"admins" | "sellers">) {
  abstract class HubCouponWritableController extends HubCouponReadableController<Actor>(
    props,
  ) {
    /**
     * Register a discount coupon.
     *
     * Design and register a new discount coupon.
     *
     * Please note that editing of coupons is not possible. Instruct users to
     * delete and create a new one.
     *
     * @param input Discount coupon input information
     * @returns Discount coupon information
     * @author Samchon
     * @tag Coupon
     */
    @core.TypedRoute.Post()
    public create(
      @props.AuthGuard() actor: Actor,
      @core.TypedBody() input: IHubCoupon.ICreate,
    ): Promise<IHubCoupon> {
      return HubCouponProvider.create({
        actor,
        input,
      });
    }

    /**
     * Delete discount coupon.
     *
     * However, coupons that have already started discounting cannot be deleted.
     *
     * @param id {@link IHubCoupon.id} of the target discount coupon
     * @author Samchon
     * @tag Coupon
     */
    @core.TypedRoute.Delete(":id")
    public erase(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<void> {
      return HubCouponProvider.erase({
        actor,
        id,
      });
    }
  }
  return HubCouponWritableController;
}
