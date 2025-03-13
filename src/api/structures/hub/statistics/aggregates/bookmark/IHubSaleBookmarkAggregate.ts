import { tags } from "typia";

export interface IHubSaleBookmarkAggregate {
  /**
   * Number of bookmarks.
   */
  bookmark_count: number & (tags.Type<"uint64"> | tags.Minimum<0>);

  /**
   * Total number of bookmarks.
   */
  total_bookmark_count: number & (tags.Type<"uint64"> | tags.Minimum<0>);
}
