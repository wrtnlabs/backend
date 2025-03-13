import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderDiscountable } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderDiscountable";
import { IHubOrderPrice } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderPrice";

import { HubOrderPriceProvider } from "../../../../providers/hub/orders/HubOrderPriceProvider";
import { HubOrderProvider } from "../../../../providers/hub/orders/HubOrderProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubOrderController } from "../../base/orders/HubOrderController";

@Controller("hub/customers/orders")
export class HubCustomerOrderController extends HubOrderController({
  path: "customers",
  AuthGuard: HubCustomerAuth,
}) {
  /**
   * Create a user order.
   *
   * The user creates an order.
   *
   * @param input Information about the {@link IHubOrder} to be created
   * @return Information about the created order
   * @author Asher
   * @tag Order
   */
  @core.TypedRoute.Post()
  public create(
    @HubCustomerAuth() actor: IHubCustomer,
    @core.TypedBody() input: IHubOrder.ICreate,
  ): Promise<IHubOrder> {
    return HubOrderProvider.create({
      actor,
      input,
    });
  }

  /**
   * Delete user order.
   *
   * Delete an order that has not been published or opened yet.
   *
   * @param id {@link IHubOrder.id} of the target order
   * @author Samchon
   * @tag Order
   */
  @core.TypedRoute.Delete(":id")
  public erase(
    @HubCustomerAuth() actor: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubOrderProvider.erase({
      actor,
      id,
    });
  }

  /**
   * Calculate possible discount combinations.
   *
   * Calculate the possible discount methods for the products currently being
   * ordered.
   *
   * The returned information contains the combinations of available deposits and
   * configurable coupons.
   *
   * However, please note that this possible discount combination can only be
   * applied to the order if the order has not been published yet.
   *
   * @param id {@link IHubOrder.id} of the target order
   * @param input Information about the target {@link IHubOrderGood products}
   * @returns Discount combination information
   *
   * @author Samchon
   * @tag Order
   */
  @core.TypedRoute.Patch(":id/discountable")
  public discountable(
    @HubCustomerAuth() actor: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubOrderDiscountable.IRequest,
  ): Promise<IHubOrderDiscountable> {
    return HubOrderPriceProvider.discountable({
      customer: actor,
      id,
      input,
    });
  }

  /**
   * Apply a discount to an order.
   *
   * Apply {@link IHubCoupon discount coupon} to the current
   * {@link IHubOrder order}, and reduce the total deposit amount, including fixed
   * and variable costs that must be paid {@link IHubOrderPublish.paid_at}.
   *
   * In principle, it is also possible to make the cash payment amount 0 won
   * by using the above combinations.
   *
   * However, before applying a discount coupon, be sure to call the
   * {@link discountable} function in advance. Discount coupons have complex
   * constraints, and the {@link discountable} function will analyze them and
   * provide detailed information on which
   * {@link IHubCouponCombination discount coupon combination} can be applied
   * to the current order.
   *
   * @param id {@link IHubOrder.id} of the target order
   * @param input Information on discount coupons, mileage, deposit, etc. to apply
   * @returns Price information with the discount reflected
   * @author Samchon
   * @tag Order
   */
  @core.TypedRoute.Patch(":id/discount")
  public discount(
    @HubCustomerAuth() actor: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubOrderPrice.ICreate,
  ): Promise<IHubOrderPrice> {
    return HubOrderPriceProvider.discount({
      customer: actor,
      id,
      input,
    });
  }
}
