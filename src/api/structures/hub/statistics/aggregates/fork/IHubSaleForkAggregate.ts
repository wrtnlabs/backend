import { tags } from "typia";

/**
 * Aggregate download information for this property.
 */
export interface IHubSaleForkAggregate {
  fork_count: number & (tags.Type<"uint64"> | tags.Minimum<0>);

  total_fork_count: number & (tags.Type<"uint64"> | tags.Minimum<0>);
}
