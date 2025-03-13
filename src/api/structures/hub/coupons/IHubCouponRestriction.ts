import { tags } from "typia";

/**
 * Constraints of discount coupons.
 *
 * @author Samchon
 */
export interface IHubCouponRestriction {
  /**
   * Can discount coupons be viewed publicly?
   *
   * - `public`: Coupons available for ordering can be viewed in bulk
   * - `private`: Unable to view in bulk
   * - Randomly assigned by the seller or administrator
   * - Can only be issued through a one-time link
   */
  access: "public" | "private";

  /**
   * Exclusivity.
   *
   * An exclusive discount coupon refers to a discount coupon that has
   * an exclusive relationship with other discount coupons and can
   * only be used alone. In other words, when an exclusive discount coupon
   * is used, no other discount coupons can be used for the same
   * {@link IHubOrder order} or {@link IHubOrderGood product}.
   */
  exclusive: boolean;

  /**
   * Issuance quantity limit.
   *
   * If there is a limit on the issuance quantity, it is impossible to issue
   * tickets exceeding this value.
   *
   * That is, the concept of first-come-first-served N coupons is created.
   */
  volume: null | (number & tags.Type<"uint32">);

  /**
   * Limit the issuance quantity per person.
   *
   * As a limit on the total issuance quantity per person, it is common
   * to assign 1 to limit duplicate issuance to the same citizen, or use
   * the `null` value to not impose a limit.
   *
   * Of course, you can limit the total issuance quantity to the same citizen
   * by assigning a value of N.
   */
  volume_per_citizen: null | (number & tags.Type<"uint32">);

  /**
   * Expiration date.
   *
   * The concept is that after receiving a discount coupon ticket,
   * it expires after N days.
   *
   * Therefore, customers should consume the ticket within N days
   * after it is issued.
   */
  expired_in: null | (number & tags.Type<"uint32">);

  /**
   * Expiration date.
   *
   * The concept of expiration after YYYY-MM-DD has passed after
   * the discount coupon ticket is issued.
   *
   * Can be double-constrained with {@link expired_in}.
   */
  expired_at: null | (string & tags.Format<"date-time">);
}
