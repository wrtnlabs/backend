import { tags } from "typia";

// TODO : 토큰 구매량 통계
export interface IHubOrderGoodTokenAggregate {
  date: string & (tags.Format<"date"> | tags.Format<"date-time">);

  /**
   * The number of tokens for the product ordered.
   */
  token: number & tags.Type<"uint32">;
}

export namespace IHubOrderGoodTokenAggregate {
  export interface IRequest {
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
      model_id?: Array<string & tags.Format<"uuid">>;
    }
  }

  export interface IEntireRequest {
    model_id?: Array<string & tags.Format<"uuid">>;
  }
}
