import { tags } from "typia";

/**
 * Confirmation information of the order.
 *
 * `IHubOrderPublish` is an entity that visualizes the confirmation
 * information of the order. Therefore, the existence of this entity means
 * that the {@link IHubCustomer customer}'s {@link IHubOrder requested order}
 * has been established as a contract and confirmed.
 *
 * However, even if the contract is confirmed, it does not start immediately.
 * When confirming the contract, (or each ordered product) can set the
 * {@link IHubOrderGood.opened_at opening time} of the contract. This is designed
 * so that the opening time of the contract can be postponed because the customer
 * needs to analyze and develop the API after purchasing the seller's API.
 *
 * However, even if the opening time of the contract is later, the fixed cost
 * for the first month is converted to a deposit status when the contract takes
 * effect. Of course, the order contract can be canceled and refunded before
 * the opening time of the contract.
 *
 * @author Samchon
 */
export interface IHubOrderPublish {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * The date and time the record was created.
   */
  created_at: string & tags.Format<"date-time">;
}

export namespace IHubOrderPublish {
  /**
   * Confirmation input information for your order.
   */
  export interface ICreate extends IOpen, IClose {}

  /**
   * Edit contract start date information.
   */
  export interface IOpen {
    /**
     * Apply the start date of the order contract in bulk.
     *
     * The start date of the order contract is set for all
     * {@link IHubOrderGood products}.
     *
     * The effective date can be pushed back from the order confirmation date.
     * And the effective date of the contract can be continuously edited until
     * it arrives.
     *
     * Also, the monthly fixed fee is calculated based on the start date.
     *
     * Please note that after the customer purchases the seller's API, the
     * review and development process is necessary, so the effective date of
     * the contract cannot help but be pushed back further than the order
     * confirmation.
     *
     * > It is also possible to set a different start date for each order product.
     */
    opened_at: null | (string & tags.Format<"date-time">) | "now";
  }

  /**
   * Edit information on the termination date of the order contract.
   */
  export interface IClose {
    /**
     * Apply the order contract termination date in bulk.
     *
     * Set the order contract termination date in bulk for all
     * {@link IHubOrderGood products}.
     *
     * However, the contract termination date cannot be set immediately. From
     * the contract initiation date, it can only be cancelled after a minimum
     * period of 1 month has passed. And if the contract has already been
     * initiated, it can only be terminated in 1-month units.
     *
     * > It is also possible to set different termination dates for each order product.
     */
    closed_at: null | (string & tags.Format<"date-time">);
  }
}
