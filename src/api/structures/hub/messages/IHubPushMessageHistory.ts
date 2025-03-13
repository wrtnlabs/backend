import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubPushMessage } from "./IHubPushMessage";

/**
 *  History of push message issuance.
 *
 *  @author Samchon
 */
export interface IHubPushMessageHistory {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   *  Metadata information.
   */
  message: IHubPushMessage;

  /**
   *  Source record occurred the push message history.
   */
  source_id: string & tags.Format<"uuid">;

  /**
   *  Variables binded to the push message content.
   */
  variables: Record<string, string>;

  /**
   *  Creation time of the history.
   */
  created_at: string & tags.Format<"date-time">;

  /**
   *  Read time of the history.
   */
  read_at: null | (string & tags.Format<"date-time">);
}
export namespace IHubPushMessageHistory {
  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      from?: string & tags.Format<"date-time">;
      to?: string & tags.Format<"date-time">;
      message?: Pick<IHubPushMessage.IRequest.ISearch, "code" | "source">;
    }
    export type SortableColumns = "history.created_at" | "history.read_at";
  }
}
