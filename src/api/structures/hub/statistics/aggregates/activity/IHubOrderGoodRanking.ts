import { tags } from "typia";

import { IAverage } from "@wrtnlabs/os-api/lib/structures/common/IAverage";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

/**
 * Listing API information for the subscribed API.
 *
 * @author Asher
 */
export interface IHubOrderGoodRanking {
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
   * API response number of responses 201 - 299.
   */
  status_2xx: number & tags.Type<"uint32">;

  /**
   * API response number of responses 301 - 399.
   */
  status_3xx: number & tags.Type<"uint32">;

  /**
   * API response number of 401 to 499 responses.
   */
  status_4xx: number & tags.Type<"uint32">;

  /**
   * API response number of 501 to 599 responses.
   */
  status_5xx: number & tags.Type<"uint32">;

  /**
   * The number of times an API response field is null.
   */
  none: number & tags.Type<"uint32">;

  /**
   * API billing costs.
   */
  cost: number & tags.ExclusiveMinimum<0>;

  /**
   * Ranking value.
   *
   * This is the most frequently called API ranking, and tied cases are handled as follows:
   *
   * 1. Listing with the most API calls
   * 2. Listing with the most successful API calls
   * 3. Listing created faster
   */
  value: number & tags.Type<"uint32">;

  /**
   * Statistics on API response latency.
   *
   * If there is no API success transmission or reception, this value is `null`.
   */
  latency: IAverage | null;
}

export namespace IHubOrderGoodRanking {
  export interface IRequest extends IPage.IRequest {
    /**
     * Search information.
     */
    search?: IRequest.ISearch;

    /**
     * Period type.
     */
    term: "hour" | "day" | "week" | "month" | "quarter" | "year";
  }

  export namespace IRequest {
    /**
     * Search criteria.
     */
    export interface ISearch {
      from?: string & tags.Format<"date">;
      to?: string & tags.Format<"date">;
      sale_ids?: Array<string & tags.Format<"uuid">>;
      good_ids?: Array<string & tags.Format<"uuid">>;
    }
  }

  export interface IEntireRequest {
    sale_ids?: Array<string & tags.Format<"uuid">>;
    good_ids?: Array<string & tags.Format<"uuid">>;
  }
}
