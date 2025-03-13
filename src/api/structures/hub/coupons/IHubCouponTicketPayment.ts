import { tags } from "typia";

import { IHubCouponTicket } from "./IHubCouponTicket";

/**
 * Discount coupon ticket payment (payment) history.
 *
 * {@link IHubCouponTicketPayment} is an entity that visualizes payment information
 * for {@link IHubOrder order} of discount coupon ticket {@link IHubCouponTicket},
 * and is used when {@link IHubCustomer consumer} uses the discount coupon ticket
 * issued to him/her for an order and has the payment amount deducted.
 *
 * Also, {@link IHubOrder} is not an entity used when an order is completed, but
 * is an entity designed to express the order application stage as well, so the
 * `IHubCouponTicketPayment` record is not actually created, but the ticket is not
 * actually deleted. Until the customer confirms the
 * {@link IHubOrder.published_at order}, the ticket is understood as a kind of
 * deposit state.
 *
 * In addition, this record can be deleted by the customer himself by reversing
 * the payment of the ticket, but it can also be deleted together with the
 * cancellation of the order itself.
 *
 * @author Samchon
 */
export interface IHubCouponTicketPayment {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Discount coupon tickets.
   */
  ticket: IHubCouponTicket;

  /**
   * Ticket issuance date and time.
   */
  created_at: string & tags.Format<"date-time">;
}
