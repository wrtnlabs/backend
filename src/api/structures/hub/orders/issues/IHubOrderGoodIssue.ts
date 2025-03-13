import { IBbsArticle } from "../../../common/IBbsArticle";
import { IPage } from "../../../common/IPage";
import { IHubCustomer } from "../../actors/IHubCustomer";
import { IHubSeller } from "../../actors/IHubSeller";
import { IHubOrderGoodIssueFee } from "./IHubOrderGoodIssueFee";

/**
 * Purchased product related issue article.
 *
 * {@link IHubOrderGoodIssue} is a bulletin board where customers and sellers
 * can raise issues with each other regarding products that customers have ordered
 * and paid for.
 *
 * Customers and sellers can write issue posts by topic for products and continue
 * discussions in the comments.
 *
 * In addition, among the types of issues, customers can request additional work
 * such as custom production or modification from sellers. In this case, sellers
 * can charge customers a fee and claim reasonable costs for the additional work.
 *
 * Lastly, the customer or seller who wrote the issue can close it (closed_at)
 * after completing it. However, even after closing the issue, comments can continue
 * to be written on the issue, and it is also possible for sellers to charge a fee.
 *
 * @author Samchon
 */
export interface IHubOrderGoodIssue extends IBbsArticle {
  /**
   * Author.
   *
   * Written by {@link IHubCustomer} or {@link IHubSeller}.
   */
  writer: IHubCustomer | IHubSeller.IInvert;

  /**
   * List of proposed fees.
   */
  fees: IHubOrderGoodIssueFee[];
}

export namespace IHubOrderGoodIssue {
  export type ISnapshot = IBbsArticle.ISnapshot;

  /**
   * Issue article input information.
   */
  export interface ICreate extends IBbsArticle.ICreate {}

  /**
   * Issue article edit information.
   *
   * Exactly matches the snapshot registration information.
   */
  export type IUpdate = ICreate;

  /**
   * Search issue posts and page information.
   */
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
    /**
     * Search information.
     */
    export interface ISearch {
      title?: string;
      content?: string;
      title_or_content?: string;
    }

    export type SortableColumns =
      | IBbsArticle.IRequest.SortableColumns
      | "nickname"
      | "fee_amount"
      | "fee_count";
  }
  export interface ISummary extends IBbsArticle.ISummary {
    writer: IHubCustomer | IHubSeller.IInvert;
  }
}
