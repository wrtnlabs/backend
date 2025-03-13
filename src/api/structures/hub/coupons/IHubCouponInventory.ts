import { tags } from "typia";

/**
 * Remaining stock information for discount coupons.
 *
 * @author Samchon
 */
export interface IHubCouponInventory {
  /**
   * Remaining quantity.
   */
  volume: null | (number & tags.Type<"uint32">);

  /**
   * Remaining quantity per person.
   */
  volume_per_citizen: null | (number & tags.Type<"uint32">);
}
