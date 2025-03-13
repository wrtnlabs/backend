import { tags } from "typia";

import { IHubAdministrator } from "../../actors/IHubAdministrator";
import { IHubSeller } from "../../actors/IHubSeller";
import { IHubSaleSnapshot } from "../IHubSaleSnapshot";

/**
 * Information on the revision of the listing review.
 *
 * This exchange requires the review of {@link IHubSale listings} registered or
 * modified by {@link IHubSeller sellers} by {@link IHubAdministrator administrator}.
 * During the review, the administrator and the seller can exchange
 * {@link IHubSaleAuditComment comments} and revise and modify the listing.
 *
 * This entity `IHubSaleAuditEmendation` is an entity that visualizes this
 * revision, and has information on which {@link IHubSaleSnapshot snapshot} the
 * administrator or seller revised, and what the newly created snapshot is
 * as a result.
 *
 * The revision target does not necessarily have to be the most recent snapshot,
 * and in some cases, it is possible to roll back or branch by revising a previous
 * snapshot. Of course, the snapshot to be revised must be related to the
 * current audit, and revisions cannot be made to snapshots that have passed
 * the previous audit.
 *
 * In addition, revisions can only be made while the audit is in progress,
 * and once the audit is {@link IHubSaleAuditApproval approved}, no further
 * revisions are possible. However, if the administrator
 * {@link IHubSaleAuditRejection rejected} the audit, the seller can revise
 * and reinforce it themselves, and request a re-review from the administrator.
 *
 * @author Samchon
 */
export interface IHubSaleAuditEmendation {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * The entity that performed the revision.
   *
   * Revision can be performed by both the administrator and the sales party.
   */
  emender: IHubAdministrator.IInvert | IHubSeller.IInvert;

  /**
   * {@link IHubSaleAuditSnapshot.id} of the original snapshot to be reviewed.
   *
   * The snapshot to be reviewed does not necessarily have to be the snapshot
   * at the time of the start of the review. It is possible to review additional
   * results from another review, and it is also possible to go back to
   * a previous review and review again.
   */
  source_snapshot_id: string & tags.Format<"uuid">;

  /**
   * {@link IHubSaleAuditSnapshot.id} of the newly created snapshot as a result
   * of the revision.
   */
  emended_snapshot_id: string & tags.Format<"uuid">;

  /**
   * Reason for revision.
   *
   * A proper description of why the revision was made and what was changed.
   */
  description: null | string;

  /**
   * The date and time the record was created.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubSaleAuditEmendation {
  /**
   * Input information for editing.
   */
  export interface ICreate {
    /**
     * {@link IHubSaleAuditSnapshot.id} of the original snapshot to be reviewed.
     *
     * The snapshot to be reviewed does not necessarily have to be the snapshot
     * at the time of the start of the review. It is possible to review additional
     * results from another review, and it is also possible to go back to a
     * previous review and review again.
     */
    source_snapshot_id: string & tags.Format<"uuid">;

    /**
     * Reason for revision.
     *
     * A proper description of why the revision was made and what was changed.
     */
    description: null | string;

    data: IHubSaleSnapshot.ICreate;
  }
}
