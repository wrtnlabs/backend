import { tags } from "typia";

import { IHubAdministrator } from "../../actors/IHubAdministrator";

/**
 * Approval for listing review.
 *
 * `IHubSaleAuditApproval` is an entity that embodies the action of
 * {@link IHubAdministrator administrator} approving
 * {@link IHubSaleAudit listing review}.
 *
 * Note that the administrator who initiated the `IHubSaleAudit` review
 * and the administrator who processes the approval can be different people.
 * Also, it is possible to {@link IHubSaleAuditRejection reject} the review
 * and then reverse and approve it. However, it is impossible to reverse and
 * reject an already approved review.
 *
 * This is because the listing is actually sold upon approval.
 *
 * @author Samchon
 */
export interface IHubSaleAuditApproval {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * {@link IHubSaleSnapshot.id} of the snapshot to be approved.
   */
  snapshot_id: string & tags.Format<"uuid">;

  /**
   * Approving Administrator.
   *
   * The approving administrator may be different from the
   * {@link IHubSaleAudit.administrator initiating administrator} of
   * this audit.
   */
  administrator: IHubAdministrator.IInvert;

  /**
   * Commission rate.
   *
   * The administrator approves the listing review and can set the commission rate.
   *
   * Of course, there is room for the rate to be fixed under the new policy.
   */
  fee_ratio: number & tags.Minimum<0> & tags.Maximum<1>;

  /**
   * Approval date and time.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubSaleAuditApproval {
  /**
   * Input information for property review approval.
   */
  export interface ICreate {
    /**
     * Commission rate.
     *
     * The administrator approves the listing review and can set the
     * commission rate.
     *
     * Of course, there is room for the rate to be fixed under the new policy.
     */
    fee_ratio: number & tags.Minimum<0> & tags.Maximum<1>;

    /**
     * {@link hub_sale_snapshots id} of the snapshots to be audited.
     *
     * When approving an audit, it is not necessary to only approve the last
     * {@link IHubSaleAuditEmendation emendation}. In some cases, the original
     * snapshot or a previous emendation can be approved and
     * {@link IHubSaleSnapshot.activated_at activated}.
     */
    snapshot_id: null | (string & tags.Format<"uuid">);
  }
}
