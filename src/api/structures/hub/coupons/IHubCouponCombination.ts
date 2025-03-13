import { tags } from "typia";

import { IHubCoupon } from "./IHubCoupon";
import { IHubCouponTicket } from "./IHubCouponTicket";

export interface IHubCouponCombination<
  Entry extends IHubCouponCombination.IEntry,
> {
  /**
   * Discount Coupon List.
   *
   * A list of discount coupons that have not yet been issued as tickets,
   * but are available for issuance.
   */
  coupons: IHubCoupon[];

  /**
   * List of previously issued discount coupon tickets.
   */
  tickets: IHubCouponTicket[];

  /**
   * List of total fixed cost reduction amounts for each discount coupon.
   */
  entries: Entry[];

  /**
   * Total amount of fixed cost reduction due to this combination.
   */
  amount: number;
}
export namespace IHubCouponCombination {
  /**
   * Mapping information for individual discount coupons.
   */
  export interface IEntry {
    /**
     * {@link IHubCoupon.id} for the target discount coupon.
     */
    coupon_id: string & tags.Format<"uuid">;

    /**
     * Total amount of fixed cost reduction due to discount coupons.
     */
    amount: number;
  }
}
