import { tags } from "typia";

import { IBbsArticle } from "../../../common/IBbsArticle";
import { IPage } from "../../../common/IPage";
import { IHubAdministrator } from "../../actors/IHubAdministrator";
import { IHubSaleAuditApproval } from "./IHubSaleAuditApproval";
import { IHubSaleAuditEmendation } from "./IHubSaleAuditEmendation";
import { IHubSaleAuditRejection } from "./IHubSaleAuditRejection";

/**
 * Listing audit information.
 *
 * Whenever a {@link IHubSale seller} registers and modifies a
 * {@link IHubSale listing} (whenever a new {@link IHubSaleSnapshot snapshot}
 * record is created), it requires a {@link IHubAdministrator administrator}
 * audit, and if it fails, the sale itself is impossible. `IHubSaleAudit` is
 * an entity that embodies the audit of this listing snapshot.
 *
 * And the administrator can write the audit matters as a kind of article, and the
 * seller and the administrator can continuously communicate about the audit
 * process or its results through {@link IHubSaleAuditComment comments}. Therefore,
 * this `IHubSaleAudit` is designed as a subtype entity of {@link IBbsArticle}.
 *
 * In addition, this audit article records all the modifications whenever the
 * administrator modifies it, so that both the seller and the administrator
 * can view it. Due to the nature of electronic commerce where money is involved,
 * the potential for disputes is always prevalent, and this is because the review
 * process is no exception. This is to prevent the administrator or seller from
 * manipulating the situation by changing their claims and editing articles in the
 * event of a dispute.
 *
 * In addition, it is possible for the administrator to
 * {@link IHubSaleAuditRejection reject} the review and then reverse it and
 * {@link IHubSaleAuditApproval approve} it, but it is impossible to reverse and
 * reject the review that has already been approved. This is because the sale of
 * the item has already begun the moment the review is approved.
 *
 * @author Samchon
 */
export interface IHubSaleAudit extends IBbsArticle {
  /**
   * The administrator who initiated the review.
   */
  administrator: IHubAdministrator.IInvert;

  /**
   * List of revisions.
   */
  emendations: IHubSaleAuditEmendation[];

  /**
   * List of rejected applications.
   */
  rejections: IHubSaleAuditRejection[];

  /**
   * Review approval details.
   */
  approval: null | IHubSaleAuditApproval;
}
export namespace IHubSaleAudit {
  /**
   * Snapshot information of the review article.
   */
  export type ISnapshot = IBbsArticle.ISnapshot;

  export interface IRequest extends IPage.IRequest {
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export type SortableColumns =
      | "audit.created_at"
      | "audit_rejected_at"
      | "audit.approved_at";
  }

  export interface ISummary extends IBbsArticle.ISummary {
    /**
     * The administrator who initiated the review.
     */
    administrator: IHubAdministrator.IInvert;

    /**
     * Date of rejection.
     *
     * The date of the most recent rejection is recorded.
     */
    rejected_at: null | (string & tags.Format<"date-time">);

    /**
     * Date and time of review approval.
     */
    approved_at: null | (string & tags.Format<"date-time">);
  }

  /**
   * Back reference information for the review article.
   *
   * Back reference information from the listing, only the rejection and
   * approval dates are recorded.
   */
  export interface IInvert {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * The administrator who initiated the review.
     */
    administrator: IHubAdministrator.IInvert;

    /**
     * The date and time the record was created.
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * Date of rejection.
     *
     * The date of the most recent rejection is recorded.
     */
    rejected_at: null | (string & tags.Format<"date-time">);

    /**
     * Date and time of review approval.
     */
    approved_at: null | (string & tags.Format<"date-time">);
  }

  /**
   * Enter information for the review article.
   */
  export interface ICreate extends IBbsArticle.ICreate {}

  /**
   * Edit information for review articles.
   */
  export type IUpdate = ICreate;
}
