import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubCartDiscountable } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartDiscountable";

import { HubCartCommodityProvider } from "../../../../providers/hub/orders/HubCartCommodityProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/carts/:cartId/commodities")
export class HubCustomerCartCommodityController {
  /**
   * Retrieve the list of products in the shopping cart.
   *
   * Retrieve the {@link IHubCartCommodity} list.
   *
   * The returned {@link IHubCartCommodity}s are processed with {@link IPage paging}.
   *
   * And depending on how you set the request information
   * {@link IHubCartCommodity.IRequest}, you can
   * {@link IHubCartCommodity.IRequest.limit} the number of records per page,
   * {@link IHubCartCommodity.IRequest.search} search only products that meet
   * a specific condition, or {@link IHubCartCommodity.IRequest.sort} sort conditions
   * for the three products.
   *
   * @param cartId {@link IHubCart.id} of the cart, can be omitted as `null`
   * @param input List request information {@link IHubCartCommodity.IRequest}
   * @returns Paginated {@link IHubCartCommodity} list {@link IPage}
   *
   * @author Asher
   * @tag Cart
   */
  @core.TypedRoute.Patch()
  public index(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("cartId")
    cartId: null | (string & tags.Format<"uuid">),
    @core.TypedBody() input: IHubCartCommodity.IRequest,
  ): Promise<IPage<IHubCartCommodity>> {
    return HubCartCommodityProvider.index({
      customer,
      cart: cartId ? { id: cartId } : null,
      input,
    });
  }

  /**
   * Details of a specific product in the cart.
   *
   * Retrieves a specific {@link IHubCartCommodity}.
   *
   * @param cartId {@link IHubCart.id} of the cart, can be omitted as `null`
   * @param id {@link IHubCartCommodity.id} to retrieve
   * @returns Retrieved {@link IHubCartCommodity} information
   *
   * @author Asher
   * @tag Cart
   */
  @core.TypedRoute.Get(":id")
  public at(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("cartId")
    cartId: null | (string & tags.Format<"uuid">),
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<IHubCartCommodity> {
    return HubCartCommodityProvider.at({
      customer,
      cart: cartId ? { id: cartId } : null,
      id,
    });
  }

  /**
   * Calculate discount means.
   *
   * Calculate the discount means for the raw materials and additional items
   * in the cart. The returned information contains the combinations of available
   * deposits and configurable coupons.
   *
   * @param input Request information for discount means combinations
   * @returns Discount means information
   *
   * @author Samchon
   * @tag Cart
   */
  @core.TypedRoute.Patch("discountable")
  public discountable(
    @core.TypedParam("cartId")
    cartId: null | (string & tags.Format<"uuid">),
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubCartDiscountable.IRequest,
  ): Promise<IHubCartDiscountable> {
    return HubCartCommodityProvider.discountable({
      customer,
      cart: cartId ? { id: cartId } : null,
      input,
    });
  }

  /**
   * Add a product to the cart.
   *
   * Add {@link IHubCartCommodity}.
   *
   * @param cartId {@link IHubCart.id} of the cart, can be omitted as `null`
   * @param input {@link IHubCartCommodity} information to add
   * @returns {@link IHubCartCommodity} information added
   *
   * @author Asher
   * @tag Cart
   */
  @core.TypedRoute.Post()
  public create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("cartId")
    cartId: null | (string & tags.Format<"uuid">),
    @core.TypedBody() input: IHubCartCommodity.ICreate,
  ): Promise<IHubCartCommodity> {
    return HubCartCommodityProvider.create({
      customer,
      cart: cartId ? { id: cartId } : null,
      input,
    });
  }

  /**
   * Delete a specific product in the cart.
   *
   * @param cartId {@link IHubCart.id} of the cart, can be omitted as `null`
   * @param id {@link IHubCartCommodity.id} to delete
   *
   * @author Asher
   * @tag Cart
   */
  @core.TypedRoute.Delete(":id")
  public erase(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("cartId")
    cartId: null | (string & tags.Format<"uuid">),
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubCartCommodityProvider.erase({
      customer,
      cart: cartId ? { id: cartId } : null,
      id,
    });
  }

  /**
   * Duplicate specific product input values in the cart.
   *
   * @param cartId {@link IHubCart.id} of the cart, can be omitted as `null`
   * @param id {@link IHubCartCommodity.id} of the target item
   * @returns duplicated cart input information
   *
   * @author Asher
   * @tag Cart
   */
  @core.TypedRoute.Get(":id/replica")
  public replica(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("cartId")
    cartId: null | (string & tags.Format<"uuid">),
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<IHubCartCommodity.ICreate> {
    return HubCartCommodityProvider.replica({
      customer,
      cart: cartId ? { id: cartId } : null,
      id,
    });
  }
}
