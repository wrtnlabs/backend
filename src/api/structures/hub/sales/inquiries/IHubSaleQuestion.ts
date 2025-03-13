import { IBbsArticle } from "../../../common/IBbsArticle";
import { IHubSaleInquiry } from "./IHubSaleInquiry";

/**
 * Questions about listing snapshots.
 *
 * {@link IHubSaleQuestion} is a subtype entity of {@link IHubSaleInquiry},
 * used when a customer wants to ask something about a listing
 * (a snapshot at that time) that a seller has registered.
 *
 * And like most exchanges, {@link IHubSaleQuestion} also provides a secret
 * property, which allows you to write a "secret" question that can only be
 * viewed by the customer who wrote the question and the seller.
 *
 * @author Samchon
 */
export interface IHubSaleQuestion
  extends IHubSaleInquiry<"question", IHubSaleQuestion.ISnapshot> {
  /**
   * Whether the question is a secret article.
   */
  secret: boolean;
}
export namespace IHubSaleQuestion {
  export type ISnapshot = IBbsArticle.ISnapshot;

  export interface IRequest
    extends IHubSaleInquiry.IRequest<
      IRequest.ISearch,
      IRequest.SortableColumns
    > {}
  export namespace IRequest {
    export type ISearch = IHubSaleInquiry.IRequest.ISearch;
    export type SortableColumns = IHubSaleInquiry.IRequest.SortableColumns;
  }

  /**
   * Summary of questions about the listing snapshot.
   */
  export interface ISummary extends IHubSaleInquiry.ISummary {
    type: "question";
    secret: boolean;
  }

  /**
   * Enter detailed information about your question regarding the listing snapshot.
   */
  export interface ICreate extends IBbsArticle.ICreate {
    secret: boolean;
  }

  /**
   * Detailed updates to questions about listing snapshots.
   */
  export type IUpdate = IBbsArticle.IUpdate;
}
