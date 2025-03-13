import { tags } from "typia";

import { IBbsArticleComment } from "../../../common/IBbsArticleComment";
import { IPage } from "../../../common/IPage";
import { IHubCustomer } from "../../actors/IHubCustomer";
import { IHubSeller } from "../../actors/IHubSeller";

/**
 * Comments on an article about an issue related to a purchased product.
 *
 * A subtype entity of {@link IBbsArticleComment}, used when customers and
 * sellers communicate with each other about an issue written about an
 * ordered product.
 *
 * Note that comments can still be written even after the issue has been closed.
 *
 * @author Samchon
 */
export interface IHubOrderGoodIssueComment extends IBbsArticleComment {
  /**
   * Primary key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Author.
   *
   * Written by {@link IHubCustomer} or {@link IHubSeller}
   */
  writer: IHubCustomer | IHubSeller.IInvert;
}
export namespace IHubOrderGoodIssueComment {
  /**
   * Enter information for commenting on issue posts.
   */
  export interface ICreate extends IBbsArticleComment.ICreate {}

  /**
   * Information on editing comments on issue posts.
   */
  export type IUpdate = ICreate;

  export interface ISnapshot extends IBbsArticleComment.ISnapshot {}

  export interface IRequest extends IPage.IRequest {
    /**
     * Search information.
     */
    search?: IRequest.ISearch;

    /**
     * Sort criteria.
     */
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export type ISearch = IBbsArticleComment.IRequest.ISearch;
    export type SortableColumns = IBbsArticleComment.IRequest.SortableColumns;
  }
}
