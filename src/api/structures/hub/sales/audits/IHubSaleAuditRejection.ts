import { tags } from "typia";

import { IHubAdministrator } from "../../actors/IHubAdministrator";

/**
 * Rejection for listing snapshot review.
 *
 * `IHubSaleAuditRejection` is an entity that represents the history of
 * {@link IHubAdministrator administrator} rejecting
 * {@link IHubSaleAudit listing review}.
 *
 * Note that the administrator who
 * {@link IHubSaleAudit.administrator initiated the review} and the administrator
 * who processes the rejection may be different people. Also, if
 * {@link IHubSeller seller} requests a re-review in the comments, the administrator
 * can repeat the rejection process.
 *
 * @author Samchon
 */
export interface IHubSaleAuditRejection {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * The administrator who rejected the review.
   */
  administrator: IHubAdministrator.IInvert;

  /**
   * Whether or not to reverse.
   *
   * Whether to confirm the current rejection and not to reverse it.
   *
   * However, this is only an expression of intent to the judge that the
   * current rejection is confirmed and that there will be no future reversal
   * and approval. In reality, it is possible to express intent in this way and
   * then later reverse and approve it.
   */
  reversible: boolean;

  /**
   * Date and time of rejection.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubSaleAuditRejection {
  /**
   * Enter information for rejection of review.
   */
  export interface ICreate {
    /**
     * Whether or not to reverse.
     *
     * Whether to confirm the current rejection and not to reverse it.
     *
     * However, this is only an expression of intent to the judge that
     * the current rejection is confirmed and that there will be no future reversal
     * and approval. In reality, it is possible to express intent in this way and
     * then later reverse and approve it.
     */
    reversible: boolean;
  }
}
