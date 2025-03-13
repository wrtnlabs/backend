import { IHubCouponCriteria } from "./IHubCouponCriteria";

/**
 * Super type for the conditions to which discount coupons are applied.
 *
 * `IHubCouponCriteriaBase` is a super type entity for the conditions to which
 * {@link IHubCoupon Discount Coupon} is applied. All subtype entities that want
 * to impose restrictions on the reference unit of discount coupons are created
 * by inheriting this.
 *
 * And the restrictions on the reference unit can be determined through the
 * {@link IHubCouponCriteriaBase.direction} property whether to proceed as an
 * inclusion condition or an exclusion condition.
 *
 * If this value is `"include"`, it is a coupon that can be applied only to
 * the reference target, and on the contrary, if this value is `"exclude"`, it is
 * a coupon that cannot be applied to the reference target.
 *
 * @template Type Detailed type of condition, identifier of discriminated union
 * @author Samchon
 */
export interface IHubCouponCriteriaBase<Type extends IHubCouponCriteria.Type> {
  /**
   * Detailed type of condition.
   *
   * Serves as identifier for discriminated union.
   */
  type: Type;

  /**
   * Direction in which constraints are applied.
   *
   * - include: inclusion conditions
   * - exclude: exclusion conditions
   */
  direction: "include" | "exclude";
}
export namespace IHubCouponCriteriaBase {
  /**
   * Common input information for discount coupon constraints.
   */
  export interface ICreate<Type extends IHubCouponCriteria.Type> {
    /**
     * Detailed type of condition.
     *
     * Serves as identifier for discriminated union.
     */
    type: Type;

    /**
     * Direction in which constraints are applied.
     *
     * - include: inclusion conditions
     * - exclude: exclusion conditions
     */
    direction: "include" | "exclude";
  }
}
