import { IBbsArticleComment } from "../../../common/IBbsArticleComment";
import { IHubCustomer } from "../../actors/IHubCustomer";
import { IHubSeller } from "../../actors/IHubSeller";

/**
 * Comments on the question.
 *
 * Comments on the question can be freely written by anyone,
 * even if they are not a party to the question.
 *
 * @author Samchon
 */
export interface IHubSaleInquiryComment extends IBbsArticleComment {
  /**
   * The author of the query comment.
   *
   * Can be {@link IHubCustomer} or {@link IHubSeller.IInvert}
   */
  writer: IHubCustomer | IHubSeller.IInvert;
}
export namespace IHubSaleInquiryComment {
  export interface ISnapshot extends IBbsArticleComment.ISnapshot {}

  /**
   * Search query comments and page request information.
   */
  export interface IRequest
    extends IBbsArticleComment.IRequest<
      IRequest.ISearch,
      IRequest.SortableColumns
    > {}
  export namespace IRequest {
    export interface ISearch extends IBbsArticleComment.IRequest.ISearch {
      name?: string;
      nickname?: string;
    }
    export type SortableColumns = IBbsArticleComment.IRequest.SortableColumns;
  }

  /**
   * Input information required to create a query comment.
   */
  export interface ICreate extends IBbsArticleComment.ICreate {}

  /**
   * Input information required to edit a question comment.
   */
  export type IUpdate = ICreate;
}
