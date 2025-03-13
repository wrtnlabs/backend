import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";

/**
 * List of APIs based on top usage.
 */
export interface IRank {
  /**
   * Product Name
   * {@link IHubOrderGood.id}
   */
  id: string & tags.Format<"uuid">;
  /**
   * Product Name
   */
  good_name: string;

  /**
   * Total number of product calls.
   */
  good_total_call_count: number & tags.Type<"uint64">;
}

/**
 * Aggregated information about the ordered items for sale.
 *
 * Includes graph information.
 */
export interface IHubSaleGoodCustomerAggregate {
  id: string & tags.Format<"uuid">;

  /**
   * Total number of calls.
   */
  total_call_count: number & tags.Type<"uint64">;

  /**
   * Total number of failures.
   */
  total_failed_count: number & tags.Type<"uint64">;

  /**
   * Product delay time.
   */
  latency: number & tags.Type<"double">;

  /**
   * Product Name
   */
  sale_name: string;

  /**
   * List of APIs based on top usage.
   */
  ranks: IRank[];
}

export namespace IHubSaleGoodCustomerAggregate {
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
      id?: string[];
    }

    export type SortableColumns = "id";
  }

  export interface ITerm {
    time_unit: "month" | "year" | "week" | "day" | "hour" | "quarter" | "half";
    count_unit: number & tags.Type<"uint64">;
  }

  export interface ICreate extends IHubSaleGoodCustomerAggregate {}
}
