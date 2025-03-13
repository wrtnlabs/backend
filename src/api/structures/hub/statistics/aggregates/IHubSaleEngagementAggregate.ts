import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSaleBookmarkAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/bookmark/IHubSaleBookmarkAggregate";
import { IHubSaleForkAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/fork/IHubSaleForkAggregate";
import { IHubSaleViewCountAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/view/IHubSaleViewCountAggregate";

/**
 * Aggregated information about actions on listings.
 *
 * Aggregated information that combines
 * {@link IHubSaleViewCountAggregate view statistics},
 * {@link IHubSaleForkAggregate download statistics}, and
 * {@link IHubSaleBookmarkAggregate bookmark statistics}.
 *
 * @author Asher.
 */
export interface IHubSaleEngagementAggregate {
  /**
   * Listing ID
   * {@link IHubSale.id}
   */
  id: string & tags.Format<"uuid">;

  /**
   * Listing Name
   * {@link IHubSale.name}
   */
  sale_name: string;

  /**
   * Property search statistics.
   */
  view: IHubSaleViewCountAggregate;

  /**
   * Download statistics for the listing
   */
  fork: IHubSaleForkAggregate;

  /**
   * Bookmark statistics for listings
   */
  bookmark: IHubSaleBookmarkAggregate;
}

export namespace IHubSaleEngagementAggregate {
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
     * Search criteria.
     */
    export interface ISearch {
      term: ITerm;
      from?: string & tags.Format<"date">;
      to?: string & tags.Format<"date">;
      sale_id?: Array<string & tags.Format<"uuid">>;
    }

    export interface ITerm {
      time_unit:
        | "month"
        | "year"
        | "week"
        | "day"
        | "hour"
        | "quarter"
        | "half";
      count_unit: number & tags.Type<"uint64">;
    }

    export type SortableColumns =
      | "view_count"
      | "viewer_count"
      | "bookmark_count"
      | "total_view_count"
      | "total_bookmark_count";
  }
}
