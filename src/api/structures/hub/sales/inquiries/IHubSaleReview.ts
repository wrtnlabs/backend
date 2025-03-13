import { tags } from "typia";

import { IBbsArticle } from "../../../common/IBbsArticle";
import { IHubSaleInquiry } from "./IHubSaleInquiry";

/**
 * Reviews for listing snapshots.
 *
 * {@link IHubSaleReview} is a subtype entity of {@link IHubSaleInquiry}, and is
 * used when a customer purchases a listing (a snapshot at that time) registered
 * by a seller as a product and wants to leave a review and evaluation for it.
 *
 * Note that {@link IHubSaleReview} and {@link IHubOrderGood} are algebraically
 * N:1, but that does not mean that a customer can continue to write reviews
 * for the same product indefinitely.
 *
 * @author Samchon
 */
export interface IHubSaleReview
  extends IHubSaleInquiry<"review", IHubSaleReview.ISnapshot> {}
export namespace IHubSaleReview {
  export interface ISnapshot extends IBbsArticle.ISnapshot {
    /**
     * Review Rating Score
     */
    score: number & tags.Minimum<0> & tags.Maximum<100>;
  }

  /**
   * Information on requesting reviews for a listing snapshot.
   */
  export interface IRequest
    extends IHubSaleInquiry.IRequest<
      IRequest.ISearch,
      IRequest.SortableColumns
    > {}
  export namespace IRequest {
    export interface ISearch
      extends IHubSaleInquiry.IRequest.ISearch,
        IInvertSearch.IScoreRange {}
    export type SortableColumns =
      | IHubSaleInquiry.IRequest.SortableColumns
      | "score";
  }

  /**
   * Summary of reviews for the listing snapshot.
   */
  export interface ISummary extends IHubSaleInquiry.ISummary {
    type: "review";
    score: number;
  }

  /**
   * Search review information for listing snapshots.
   */
  export interface IInvertSearch {
    score?: IInvertSearch.IScoreRange;
    count?: IInvertSearch.ICountRange;
  }

  export namespace IInvertSearch {
    export interface IScoreRange {
      minimum?: number & tags.Minimum<0> & tags.Maximum<100>;
      maximum?: number & tags.Minimum<0> & tags.Maximum<100>;
    }
    export interface ICountRange {
      minimum?: number & tags.Type<"uint32">;
      maximum?: number & tags.Type<"uint32">;
    }
  }

  /**
   * Input information to create a review for a listing snapshot.
   */
  export interface ICreate extends IBbsArticle.ICreate {
    good_id: string & tags.Format<"uuid">;
    score: number & tags.Minimum<0> & tags.Maximum<100>;
  }

  /**
   * Information on editing reviews for listing snapshots.
   */
  export interface IUpdate extends Omit<ICreate, "good_id"> {}
}
