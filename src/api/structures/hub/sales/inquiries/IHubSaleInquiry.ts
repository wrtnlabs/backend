import { tags } from "typia";

import { IBbsArticle } from "../../../common/IBbsArticle";
import { IHubCustomer } from "../../actors/IHubCustomer";
import { IHubSaleInquiryAnswer } from "./IHubSaleInquiryAnswer";

/**
 * Inquiry about listing snapshot.
 *
 * {@link IHubSaleInquiry} is a subtype entity of {@link IBbsArticle}, and it
 * embodies an inquiry written by a customer about a listing registered by
 * a seller (only in snapshot units for accurate tracking).
 *
 * In addition, since the customer is in the position of waiting for the seller's
 * response after writing the inquiry, it provides it for reference as to whether
 * the seller has read the inquiry written by the customer.
 *
 * Of course, since the inquiry itself is a subtype of an article, it is possible
 * for the seller to communicate with each other through comments before
 * an official response.
 *
 * However, comments themselves are only possible for customers, even if
 * they are not the person who wrote the article. Of course, sellers cannot write
 * if they are not the person who wrote the article.
 *
 * @author Samchon
 */
export interface IHubSaleInquiry<
  Type extends "question" | "review",
  Snapshot extends IBbsArticle.ISnapshot,
> extends IBbsArticle<Snapshot> {
  /**
   * Type of question article
   *
   * @example question: question
   * @example review: review
   */
  type: Type;

  /**
   * Customer of the query article.
   *
   * {@link IHubCustomer}
   */
  customer: IHubCustomer;

  /**
   * Author of the question article answer.
   *
   * NULL if no answer was written.
   *
   * {@link IHubSaleInquiryAnswer}
   */
  answer: null | IHubSaleInquiryAnswer;

  /**
   * Whether the seller has viewed the inquiry article.
   */
  read_by_seller: boolean;

  /**
   * Number of likes for this question.
   */
  like_count: number & tags.Minimum<0>;

  /**
   * I like the question time.
   */
  liked_at: null | (string & tags.Format<"date-time">);
}
export namespace IHubSaleInquiry {
  export interface IRequest<
    Search extends IRequest.ISearch,
    Sortable extends IRequest.SortableColumns | string,
  > extends IBbsArticle.IRequest<Search, Sortable> {}

  /**
   * Search query and page request information.
   */
  export namespace IRequest {
    export interface ISearch extends IBbsArticle.IRequest.ISearch {
      name?: string;
      mobile?: string;
      nickname?: string;

      /**
       * Whether or not there is a response.
       *
       * - `true`: Search only for questions that have been answered
       * - `false`: Search only for questions that have not been answered
       * - `null`: both of them
       */
      answered?: boolean | null;
    }
    export type SortableColumns =
      | IBbsArticle.IRequest.SortableColumns
      | "nickname"
      | "answered_at";
  }

  /**
   * Summary of listing information
   */
  export interface ISummary extends IBbsArticle.ISummary {
    /**
     * Customers who write inquiries.
     */
    customer: IHubCustomer;

    /**
     * Attribution answer
     *
     * NULL if no answer.
     */
    answer: IHubSaleInquiryAnswer.ISummary | null;

    /**
     * Whether the seller has viewed the inquiry article.
     */
    read_by_seller: boolean;
  }
}
