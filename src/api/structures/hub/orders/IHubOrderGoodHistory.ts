import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";

import MethodType = IHubOrderGoodHistory.MethodType;

export interface IHubOrderGoodHistory {
  id: string & tags.Format<"uuid">;

  /**
   * The requested method.
   */
  method: MethodType;

  /**
   * The requested path.
   */
  path: string;

  /**
   * The status code of the response.
   */
  status: number | null;

  /**
   * The requested argument.
   */
  arguments: any | null;

  /**
   * The results were responded to.
   */
  output: any | null;

  /**
   * The date and time the record was created.
   */
  created_at: string & tags.Format<"date-time">;

  /**
   * The date and time the response was received.
   */
  responded_at: (string & tags.Format<"date-time">) | null;
}
export namespace IHubOrderGoodHistory {
  export interface ISummary {
    id: string & tags.Format<"uuid">;
    status: number | null;
    created_at: string & tags.Format<"date-time">;
    responded_at: (string & tags.Format<"date-time">) | null;
  }

  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }

  export namespace IRequest {
    export interface ISearch {
      unit_id?: string & tags.Format<"uuid">;
    }
    export type SortableColumns = "history.created_at" | "history.responded_at";
  }

  export type MethodType = "head" | "get" | "post" | "put" | "patch" | "delete";
}
