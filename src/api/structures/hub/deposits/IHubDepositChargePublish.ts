import { tags } from "typia";

import { IHubBankAccount } from "./IHubBankAccount";

/**
 *
 * Payment progress information for deposit of deposit.
 *
 * {@link IHubDepositChargePublish} is an entity that visualizes the
 * process of a customer requesting a deposit and proceeding with payment.
 *
 * Please note that the existence of a {@link IHubDepositChargePublish} record
 * does not mean that payment has been completed. Payment is only completed
 * when payment is completed.
 *
 * The "process of proceeding with payment" mentioned above means exactly this.
 * However, even after payment is made, there are cases where it is suddenly
 * canceled, so you should also be careful about this.
 *
 * @author Samchon
 */
export interface IHubDepositChargePublish {
  /**
   * The basic key for the payment process
   */
  id: string & tags.Format<"uuid">;

  /**
   * Record creation date and time
   */
  created_at: string & tags.Format<"date-time">;

  /**
   * Payment completion date and time.
   *
   * The charging application completion date and payment date may be
   * different. This is the case for "virtual account payment".
   */
  paid_at: null | (string & tags.Format<"date-time">);

  /**
   * Payment cancellation/refund date and time.
   */
  cancelled_at: null | (string & tags.Format<"date-time">);
}

export namespace IHubDepositChargePublish {
  /**
   * View payment progress information and page information
   */
  export interface ICreate {
    /**
     * Provider Code
     *
     * import | toss.payments
     */
    code: "iamport" | "toss.payments";

    /**
     * Payment Creation ID
     */
    store_id: string;

    /**
     * Payment Processing User ID
     */
    uid: string;
  }

  /**
   * Create refund information
   */
  export interface IRefundStore {
    /**
     * Refund account
     */
    account: IHubBankAccount | null;

    /**
     * Reason for refund
     */
    reason: string;
  }
}
