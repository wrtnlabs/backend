import { IHubCouponCriteriaOfFunnel } from "./IHubCouponCriteriaOfFunnel";
import { IHubCouponCriteriaOfSale } from "./IHubCouponCriteriaOfSale";
import { IHubCouponCriteriaOfSection } from "./IHubCouponCriteriaOfSection";
import { IHubCouponCriteriaOfSeller } from "./IHubCouponCriteriaOfSeller";

/**
 * Union type for the applicable conditions of discount coupons.
 *
 * `IHubCouponCriteria` is a union type entity for the applicable conditions of
 * {@link IHubCoupon Discount Coupon}. It groups all subtype entities that want
 * to restrict the reference unit of the discount coupon, and you can specify the
 * subtype through `if condition` as shown below.
 *
 * This is called a Discriminated Union.
 *
 * ```typescript
 * if (criteria.type === "channel")
 * console.log(criterial.channel);
 * ```
 *
 * In addition, the constraint on the reference unit can be determined whether to
 * proceed as an inclusion condition or an exclusion condition through the
 * {@link IHubCouponCriteria.direction} property. If this value is `"include"`,
 * the coupon is applicable only to the reference target, and on the contrary,
 * if it is `"exclude"`, the coupon is not applicable to the reference target.
 *
 * @author Samchon
 */
export type IHubCouponCriteria =
  | IHubCouponCriteriaOfSection
  | IHubCouponCriteriaOfSeller
  | IHubCouponCriteriaOfSale
  | IHubCouponCriteriaOfFunnel;
export namespace IHubCouponCriteria {
  /**
   * Type of discount coupon constraint.
   */
  export type Type = IHubCouponCriteria["type"];

  /**
   * Union type for input information of discount coupon constraints.
   */
  export type ICreate =
    | IHubCouponCriteriaOfSection.ICreate
    | IHubCouponCriteriaOfSeller.ICreate
    | IHubCouponCriteriaOfSale.ICreate
    | IHubCouponCriteriaOfFunnel.ICreate;

  /**
   *  @internal
   */
  export interface ICollectBase {
    id: string;
    direction: "include" | "exclude";
    type: Type;
  }
}
