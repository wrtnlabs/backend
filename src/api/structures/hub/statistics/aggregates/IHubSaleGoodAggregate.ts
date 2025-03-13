import { tags } from "typia";

/**
 * Aggregated information about the ordered items for sale.
 *
 * @author Samchon
 */
export interface IHubSaleGoodAggregate {
  /**
   *  date.
   */
  date: string & (tags.Format<"date"> | tags.Format<"date-time">);
  /**
   * Product delay time.
   */
  latency: number & tags.Type<"double">;

  /**
   * Knock count.
   *
   * {@link IHubOrder order request} was made as {@link IHubOrderGood product},
   *
   * including the number of cases that have not yet been {@link IHubOrder.published_at published}.
   *
   * - (not published) = (knock) - (publish)
   */
  knock_count: number & tags.Type<"uint64">;

  /**
   * Number of sales.
   *
   * The number of times an item has been confirmed as a {@link IHubOrderGood order item}.
   */
  publish_count: number & tags.Type<"uint64">;

  /**
   * Number of failures.
   */
  failed_count: number & tags.Type<"uint64">;

  /**
   * Number of successes.
   */
  success_count: number & tags.Type<"uint64">;

  /**
   * Number of API calls.
   */
  total_call_count: number & tags.Type<"uint64">;

  /**
   * Total fixed cost sales.
   */
  fixed: number & tags.Minimum<0>;

  /**
   * Variable cost total sales.
   */
  variable: number & tags.Minimum<0>;
}
