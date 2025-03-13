import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSaleBookmarkAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/bookmark/IHubSaleBookmarkAggregate";
import { IHubSaleForkAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/fork/IHubSaleForkAggregate";
import { IHubSaleViewCountAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/view/IHubSaleViewCountAggregate";

import { IHubSaleGoodAggregate } from "./IHubSaleGoodAggregate";
import { IHubSaleInquiryAggregate } from "./IHubSaleInquiryAggregate";
import { IHubSaleIssueAggregate } from "./IHubSaleIssueAggregate";

/**
 * Aggregated information about the listing.
 *
 * @author Samchon
 */
export interface IHubSaleAggregate {
  /**
   * Listing ID
   * {@link IHubSale.id}
   */
  id: string & tags.Format<"uuid">;

  /**
   * Aggregated information about ordered products.
   */
  good: null | IHubSaleGoodAggregate;

  /**
   * Aggregate information about the inquiry.
   */
  inquiry: IHubSaleInquiryAggregate;

  /**
   * Aggregate information about the issue.
   */
  issue: IHubSaleIssueAggregate;

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

export namespace IHubSaleAggregate {
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
      sale_id?: string & tags.Format<"uuid">;
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

  export interface ICreate extends IHubSaleAggregate {}

  export interface IEntireRequest {
    sale_ids?: Array<string & tags.Format<"uuid">>;
  }
}
