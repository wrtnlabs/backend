import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubCustomer } from "../actors/IHubCustomer";
import { IHubCoupon } from "./IHubCoupon";

/**
 * Discount coupon ticket issuance history.
 *
 * `IHubCouponTicket` is an entity that represents a discount coupon ticket
 * issued to a customer.
 *
 * And if the target {@link IHubCoupon discount coupon} specification itself
 * has an expiration date, the expiration date is recorded in {@link expired_at}
 * and it is automatically discarded after that period.
 *
 * Of course, if the discount coupon ticket was used for
 * {@link IHubCouponTicketPayment order} within the expiration date,
 * it doesn't matter.
 *
 * @author Samchon
 */
export interface IHubCouponTicket extends IHubCouponTicket.IInvert {
  /**
   * Information on affiliate discount coupons.
   */
  coupon: IHubCoupon;
}
export namespace IHubCouponTicket {
  export interface IInvert {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Information about the customer who issued the ticket.
     */
    customer: IHubCustomer;

    /**
     * Ticket issuance date and time.
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * Ticket expiration date.
     */
    expired_at: null | (string & tags.Format<"date-time">);
  }

  /**
   * Information on application for issuance using a one-time code.
   */
  export interface ITake {
    /**
     * One-time code.
     */
    code: string;
  }

  export interface IRequest extends IPage.IRequest {}

  /**
   * Information on issuing discount coupon tickets.
   *
   * Valid only when the target {@link IHubCoupon discount coupon} is public.
   *
   * If you want to obtain a ticket for a private discount coupon, use {@link ITake}.
   */
  export interface ICreate {
    /**
     * {@link IHubCoupon.id} of the discount coupon you want to issue
     *
     * @format uuid
     */
    coupon_id: string;
  }
}
