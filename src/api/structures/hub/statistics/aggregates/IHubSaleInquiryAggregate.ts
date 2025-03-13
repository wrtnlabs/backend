import { tags } from "typia";

/**
 * Aggregated information on property related inquiries.
 *
 * @author Samchon
 */
export interface IHubSaleInquiryAggregate {
  /**
   * Question aggregate information.
   */
  question: IHubSaleInquiryAggregate.IQuestion;

  /**
   * Review aggregation information.
   */
  review: IHubSaleInquiryAggregate.IReview;
}
export namespace IHubSaleInquiryAggregate {
  /**
   * Question aggregate information.
   */
  export interface IQuestion {
    /**
     * Views.
     */
    hit: number & tags.Type<"uint64">;

    /**
     * Number of questions.
     */
    count: number & tags.Type<"uint64">;

    /**
     * Number of replies.
     */
    answer_count: number & tags.Type<"uint64">;
  }

  /**
   * Review aggregation information.
   */
  export interface IReview {
    /**
     * Views.
     */
    hit: number & tags.Type<"uint64">;

    /**
     * Number of reviews.
     */
    count: number & tags.Type<"uint64">;

    /**
     * Number of replies.
     */
    answer_count: number & tags.Type<"uint64">;

    /**
     * Rating statistics.
     */
    statistics: null | IStatistics;

    /**
     * Statistical information by rating range.
     */
    intervals: IInterval[] & tags.MinItems<0> & tags.MaxItems<11>;
  }

  /**
   * Rating statistics.
   */
  export interface IStatistics {
    /**
     *  average.
     */
    average: number;

    /**
     * Standard deviation.
     */
    stdev: number;
  }

  /**
   * Statistical information by rating range.
   */
  export interface IInterval {
    /**
     * Section.
     */
    score: number;

    /**
     * Number.
     */
    count: number;
  }
}
