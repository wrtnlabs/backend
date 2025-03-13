/**
 * Information about discount methods that can be used for orders or similar.
 *
 * `IHubDiscountable` is an entity that represents the total amount of mileage
 * and deposit that can be used by {@link IHubCustomer customer} at the
 * {@link IHubOrder order request} stage, or
 * {@link IHubCouponCombination combinations of discount coupons}.
 *
 * @template Combination Type of discount coupon combination
 * @author Samchon
 */
export interface IHubDiscountable<Combination> {
  /**
   * Total amount of available deposit.
   *
   * If the current {@link IHubCustomer customer} has not yet been authenticated
   * as a {@link IHubCitizen citizen}, the `null` value is returned.
   */
  deposit: null | number;

  /**
   * List of applicable discount coupon combinations.
   *
   * This is an array of {@link IHubCoupon discount coupons} that can be
   * applied simultaneously to receive multiple discounts, and is arranged
   * in order of highest total discount amount.
   *
   * That is, the combinations with the highest expected total discount
   * {@link IHubCouponCombination.amount} are sorted in descending order.
   */
  combinations: Combination[];
}
