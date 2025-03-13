import { tags } from "typia";

import { IHubCouponCombination } from "../coupons/IHubCouponCombination";
import { IHubDiscountable } from "../coupons/IHubDiscountable";

/**
 * Information about discount methods available for orders.
 *
 * `IHubOrderDiscountable` is an entity that represents the total amount of
 * {@link IHubMileage mileage} or total deposit amount and
 * {@link IHubCouponCombination discount coupon combinations} that can be
 * used by {@link IHubCustomer customer} for {@link IHubOrder order} currently
 * in the application stage.
 *
 * @author Samchon
 */
export type IHubOrderDiscountable =
  IHubDiscountable<IHubOrderDiscountable.ICombination>;
export namespace IHubOrderDiscountable {
  /**
   * Applicable discount coupon combinations.
   */
  export type ICombination = IHubCouponCombination<IEntry>;

  /**
   * Mapping information for individual discount coupons and ordered items.
   *
   * Information describing how much fixed cost reduction each discount coupon
   * will produce for each ordered item.
   */
  export interface IEntry extends IHubCouponCombination.IEntry {
    /**
     * {@link IHubOrderGood.id} of the target product.
     */
    good_id: string & tags.Format<"uuid">;
  }

  /**
   * Information on requesting a combination of order discounts.
   */
  export interface IRequest {
    /**
     * A list of {@link IHubOrderGood.id} of target products.
     *
     * If you assign a `null` value, the discount combination will
     * be calculated for all products in the target {@link IHubOrder order}.
     */
    good_ids: null | (Array<string & tags.Format<"uuid">> & tags.MinItems<1>);
  }
}
