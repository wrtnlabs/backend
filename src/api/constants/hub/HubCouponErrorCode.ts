export const enum HubCouponErrorCode {
  /**
   * Coupon not found.
   */
  NOT_FOUND = "HUB_COUPON_NOT_FOUND",

  /**
   * Coupon not opened yet.
   */
  NOT_OPENED = "HUB_COUPON_NOT_OPENED",

  /**
   * Coupon expired.
   */
  CLOSED = "HUB_COUPON_CLOSED",

  /**
   * Coupon expired.
   */
  EXPIRED = "HUB_COUPON_EXPIRED",

  /**
   * Discount coupons with conditions that the seller cannot issue.
   */
  CRITERIA_FORBIDDEN_TO_SELLER = "HUB_COUPON_CRITERIA_FORBIDDEN_TO_SELLER",

  /**
   * Insufficient criteria for seller criteria.
   *
   * If a seller wants to issue a discount coupon, he or she must set a restriction condition for at least himself or his or her items.
   *
   * In other words, the seller cannot issue a discount coupon that is accepted by the entire market.
   */
  CRITERIA_INSUFFICIENT_FOR_SELLER = "HUB_COUPON_CRITERIA_INSUFFICIENT_FOR_SELLER",

  /**
   * Coupon already used.
   */
  ALREADY_USED = "HUB_COUPON_ALREADY_USED_COUPON",

  /**
   * Out of stock coupon.
   */
  OUT_OF_STOCK = "HUB_COUPON_OUT_OF_STOCK",

  /**
   * Coupons cannot be applied.
   */
  COUPON_NOT_APPLICABLE = "COUPON_NOT_APPLICABLE",
}
