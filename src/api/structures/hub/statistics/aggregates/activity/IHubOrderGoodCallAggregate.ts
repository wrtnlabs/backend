import { tags } from "typia";

import { IAverage } from "../../../../common/IAverage";
import { IPage } from "../../../../common/IPage";

export interface IHubOrderGoodCallAggregate {
  date: string & (tags.Format<"date"> | tags.Format<"date-time">);
  success: number & tags.Type<"uint32">;
  status_2xx: number & tags.Type<"uint32">;
  status_3xx: number & tags.Type<"uint32">;
  status_4xx: number & tags.Type<"uint32">;
  status_5xx: number & tags.Type<"uint32">;
  none: number & tags.Type<"uint32">;

  /**
   * Statistics on API response latency.
   *
   * If there is no API success transmission or reception, this value is `null`.
   */
  latency: IAverage | null;
}
export namespace IHubOrderGoodCallAggregate {
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
