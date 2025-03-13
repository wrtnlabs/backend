import { tags } from "typia";

/**
 * Aggregate information on the number of listing views.
 */
export interface IHubSaleViewCountAggregate {
  /**
   *  date.
   */
  date: string & (tags.Format<"date"> | tags.Format<"date-time">);

  /**
   * Number of views.
   */
  view_count: number & (tags.Type<"uint64"> | tags.Minimum<0>);

  /**
   * Number of views.
   */
  viewer_count: number & (tags.Type<"uint64"> | tags.Minimum<0>);

  /**
   * Total views.
   */
  total_view_count: number & (tags.Type<"uint64"> | tags.Minimum<0>);
}
