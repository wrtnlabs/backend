import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";

import { HubCouponProvider } from "../../../../providers/hub/coupons/HubCouponProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubCouponReadableController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`hub/${props.path}/coupons`)
  abstract class HubCouponReadableController {
    /**
     * View discount coupons in bulk.
     *
     * {@link IHubCoupon discount coupon} lists are returned after {@link IPage paging}.
     *
     * If the current discount coupon search target is {@link IHubCustomer customer},
     *
     * only coupons that are publicly available and that the current customer
     * can issue the {@link IHubCouponTicket ticket} will be displayed.
     *
     * @param input Page and search request information
     * @returns Paging list of discount coupons
     * @author Samchon
     * @tag Coupon
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedBody() input: IHubCoupon.IRequest,
    ): Promise<IPage<IHubCoupon>> {
      return HubCouponProvider.index({
        actor,
        input,
      });
    }

    /**
     * View individual discount coupons.
     *
     * @param id {@link IHubCoupon.id} of the target discount coupon.
     * @returns Discount coupon details
     * @author Samchon
     * @tag Coupon
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubCoupon> {
      return HubCouponProvider.at({
        actor,
        id,
      });
    }
  }
  return HubCouponReadableController;
}
