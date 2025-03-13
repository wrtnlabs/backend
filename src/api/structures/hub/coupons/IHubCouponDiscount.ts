import { tags } from "typia";

/**
 * Discount information for discount coupons.
 *
 * `IHubCouponDiscount` is an entity that contains information about
 * the amount and unit of a discount coupon, and is separated into subtypes for
 * absolute amount discounts and percentage discounts, respectively.
 *
 * @author Samchon
 */
export type IHubCouponDiscount =
  | IHubCouponDiscount.IAmount
  | IHubCouponDiscount.IPercent;
export namespace IHubCouponDiscount {
  /**
   * Total discount.
   */
  export interface IAmount {
    /**
     * Discount Unit: Total.
     */
    unit: "amount";

    /**
     * Discount amount.
     */
    value: number;

    /**
     * Minimum purchase amount for discount.
     *
     * If this value is set, the discount coupon will not be applied to orders that fall below this value.
     */
    threshold: null | (number & tags.ExclusiveMinimum<0>);
  }

  /**
   * Percentage discount.
   */
  export interface IPercent {
    /**
     * Discount Unit: Percentage.
     */
    unit: "percent";

    /**
     * Discount percentage.
     */
    value: number & tags.Minimum<0> & tags.Maximum<100>;

    /**
     * Minimum purchase amount for discount.
     *
     * If this value is set, the discount coupon will not be applied to orders that fall below this value.
     */
    threshold: null | (number & tags.ExclusiveMinimum<0>);

    /**
     * Maximum amount that can be discounted.
     *
     * If you set this value, no matter how much you order, it will not be discounted more than that amount.
     */
    limit: null | (number & tags.ExclusiveMinimum<0>);
  }
}
