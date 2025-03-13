import { tags } from "typia";

import { IHubCoupon } from "../coupons/IHubCoupon";
import { IHubCouponTicketPayment } from "../coupons/IHubCouponTicketPayment";

/**
 * Order price information.
 *
 * `IHubOrderPrice` is an entity that details the price to be paid
 * when ordering {@link IHubOrder}, and includes information on deductions
 * through {@link IHubCouponTicket discount coupon tickets}, deposits,
 * and {@link IHubMileage mileage}.
 *
 * It mostly deals with {@link IHubSaleUnitStockPrice.fixed fixed costs},
 * but in the case of {@link IHubCoupon discount coupons}, it also affects
 * variable costs in the case of percent discounts.
 *
 * @author Samchon
 */
export interface IHubOrderPrice extends IHubOrderPrice.ISummary {
  /**
   * List of payment details for discount coupon tickets.
   */
  ticket_payments: IHubCouponTicketPayment[];
}
export namespace IHubOrderPrice {
  /**
   * Summary information on the fixed cost portion of the order price.
   */
  export interface ISummary {
    /**
     * Nominal total payment.
     */
    value: number & tags.Minimum<0>;

    /**
     * Fixed cost deposit payment amount.
     */
    deposit: number & tags.Minimum<0>;

    /**
     * Fixed cost discount coupon ticket payment amount.
     */
    ticket: number & tags.Minimum<0>;
  }

  /**
   * Edit information for order prices.
   */
  export interface ICreate {
    /**
     * {@link IHubCoupon.id} List of applicable discount coupons.
     */
    coupon_ids: Array<string & tags.Format<"uuid">>;
  }
}
