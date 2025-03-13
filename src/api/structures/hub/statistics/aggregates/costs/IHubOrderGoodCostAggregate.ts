import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

export interface IHubOrderGoodCostAggregate {
  /**
   * Time information.
   */
  date: string & (tags.Format<"date"> | tags.Format<"date-time">);

  /**
   * Summary information about the target property.
   */
  sale: IHubSale.ISummary;

  /**
   * Total cost of listings per hour.
   */
  cost: number & tags.ExclusiveMinimum<0>;
}

export namespace IHubOrderGoodCostAggregate {
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
