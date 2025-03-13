import { tags } from "typia";

import { IHubCustomer } from "../../actors/IHubCustomer";

/**
 * This is an entity that embodies the act of a customer accepting and
 * accepting the issue fee charged by the seller.
 *
 * Note that the moment the customer accepts the fee and the moment it takes
 * effect can be different.
 *
 * In other words, it is possible to accept the fee at this point and have
 * the deposit withdrawn, but postpone the effect of this, so that the seller
 * can start work in the future, or to leave room for a change of mind
 * in the future.
 *
 * @author Samchon
 */
export interface IHubOrderGoodIssueFeeAccept {
  /**
   * Primary key
   */
  id: string & tags.Format<"uuid">;

  /**
   * {@link IHubCustomer}
   *
   * Customer who has been billed a fee.
   */
  customer: IHubCustomer;

  /**
   * The date and time the record was created.
   */
  created_at: string & tags.Format<"date-time">;

  /**
   * Effective date and time of acceptance of the fee.
   */
  published_at: string & tags.Format<"date-time">;

  /**
   * Date of cancellation of the fee.
   *
   * Cancellation is not possible after the effective date.
   */
  canceled_at?: null | (string & tags.Format<"date-time">);
}
export namespace IHubOrderGoodIssueFeeAccept {
  /**
   * Enter information to accept the fee.
   */
  export interface ICreate {
    /**
     * Clients who have been billed a fee.
     */
    customer: IHubCustomer;

    /**
     * The date and time the record was created.
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * Effective date and time of acceptance of the fee.
     */
    published_at: string & tags.Format<"date-time">;
  }
}
