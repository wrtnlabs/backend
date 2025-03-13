import { tags } from "typia";

import { IHubCouponCombination } from "../coupons/IHubCouponCombination";
import { IHubDiscountable } from "../coupons/IHubDiscountable";
import { IHubCartCommodity } from "./IHubCartCommodity";

/**
 * Information on discount methods that can be applied to the shopping cart.
 *
 * `IHubCartDiscountable` is an entity that represents the
 * {@link IHubMileageAggregate total amount of mileage} or
 * {@link IHubCouponCombination combination of discount coupons} that can be
 * used for {@link IHubCartCommodity raw materials} that
 * {@link IHubCustomer customer} has added or is trying to add to the
 * {@link IHubCart shopping cart}.
 *
 * Note that the item referred to here refers not only to {@link IHubCartItem}
 * that is in the shopping cart, but also {@link IHubCartItem.ICreate} that is
 * not yet in the shopping cart but is trying to be added. In other words,
 * `IHubCartDiscountable` can request discount information for
 * {@link IHubSale products} that are not yet in the shopping cart.
 *
 * @author Samchon
 */
export type IHubCartDiscountable =
  IHubDiscountable<IHubCartDiscountable.ICombination>;
export namespace IHubCartDiscountable {
  /**
   * Applicable discount coupon combinations.
   */
  export type ICombination = IHubCouponCombination<IEntry>;

  /**
   * Mapping information for individual discount coupons and shopping cart materials.
   *
   * Information describing how much fixed cost reduction each discount coupon
   * will produce for each shopping cart material.
   */
  export interface IEntry extends IHubCouponCombination.IEntry {
    /**
     * {@link IHubCartCommodity.id} of the target raw material.
     */
    commodity_id: string & tags.Format<"uuid">;

    /**
     * Fake or not.
     *
     * Whether it is a fake raw material randomly assembled from a specific
     * {@link IHubSale listing}, rather than an actual
     * {@link IHubCartCommodity shopping cart raw material}.
     */
    pseudo: boolean;
  }

  /**
   * Shopping cart discount combination request information.
   */
  export interface IRequest {
    /**
     * A list of IDs of target cart items.
     *
     * If this value is NULL, all {@link IHubCartCommodity raw materials}
     * in {@link IHubCart cart} will be targeted.
     */
    commodity_ids: null | Array<string & tags.Format<"uuid">>;

    /**
     * Product raw material input information.
     *
     * Before actually entering {@link IHubCartCommodity raw material} in the
     * shopping cart, you can receive discount information in advance, assuming that the
     * {@link IHubCartCommodity raw material} is actually entered in the shopping cart.
     *
     * That is, `IHubCartDiscountable` can request discount information even for
     * {@link IHubSale products} that are not yet in the shopping cart.
     */
    pseudos: IHubCartCommodity.ICreate[];
  }
}
