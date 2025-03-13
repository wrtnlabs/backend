import { IBbsArticleComment } from "../../../common/IBbsArticleComment";
import { IHubAdministrator } from "../../actors/IHubAdministrator";
import { IHubSeller } from "../../actors/IHubSeller";

/**
 * Comments on the review article.
 *
 * `IHubSaleAuditComment` is a subtype entity of {@link IBbsArticleComment},
 * and is used when the administrator and {@link IHubSeller seller} communicate
 * with each other regarding the {@link IHubSaleAudit review} initiated by
 * {@link IHubAdministrator administrator}.
 *
 * This also applies after the review is completed, and even for a review case
 * that has been {@link IHubSaleAuditRejection rejected} processed, the seller
 * can request a re-review as a comment. Of course, most sellers will follow the
 * administrator's guide before requesting a re-review and perform their own
 * {@link IHubSaleAuditEmension edit}.
 *
 * @author Samchon
 */
export interface IHubSaleAuditComment extends IBbsArticleComment {
  /**
   * Commenter.
   *
   * Comments on the review article can be written by the administrator and
   * seller respectively.
   *
   * Of course, the seller must be a party to the relevant listing.
   */
  writer: IHubAdministrator.IInvert | IHubSeller.IInvert;
}
export namespace IHubSaleAuditComment {
  /**
   * Snapshot information of the review comments.
   */
  export type ISnapshot = IBbsArticleComment.ISnapshot;

  /**
   * Page and search request information for review comments.
   */
  export interface IRequest
    extends IBbsArticleComment.IRequest<
      IRequest.ISearch,
      IRequest.SortableColumns
    > {}
  export namespace IRequest {
    /**
     * Search criteria information for review comments.
     */
    export interface ISearch extends IBbsArticleComment.IRequest.ISearch {}

    /**
     * The type of sortable columns.
     */
    export type SortableColumns = IBbsArticleComment.IRequest.SortableColumns;
  }

  /**
   * Comment input information.
   */
  export interface ICreate extends IBbsArticleComment.ICreate {}

  /**
   * Comment editing information.
   */
  export type IUpdate = ICreate;
}
