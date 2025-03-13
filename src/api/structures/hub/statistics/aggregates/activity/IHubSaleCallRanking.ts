import { tags } from "typia";

import { IHubSale } from "../../../sales/IHubSale";

/**
 * Ranking information based on the number of API calls for listings.
 *
 * @author Samchon
 */
export interface IHubSaleCallRanking {
  /**
   * Summary information about the target property.
   */
  sale: IHubSale.ISummary;

  /**
   * Total number of API calls.
   */
  count: number & tags.Type<"uint32">;

  /**
   * The number of successes during API calls.
   */
  success: number & tags.Type<"uint32">;

  /**
   * Ranking value.
   *
   * This is the most frequently called API ranking, and tied cases are
   * handled as follows:
   *
   * 1. Listing with the most API calls
   * 2. Listing with the most successful API calls
   * 3. Listing created faster
   */
  value: number & tags.Type<"uint32">;
}
