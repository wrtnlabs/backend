import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubPushMessageContent } from "./IHubPushMessageContent";

/**
 *  Push message metadata.
 *
 *  @author Samchon
 */
export interface IHubPushMessage {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   *  Content of the push message.
   */
  content: IHubPushMessageContent;

  /**
   *  Identifier code of the push message.
   */
  code: string;

  /**
   *  Source table name occurring the push message event.
   */
  source: string;

  /**
   *  Target actor kind to receive.
   */
  target: "customer" | "seller" | "administrator";

  /**
   *  Creation time of push message metadata.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubPushMessage {
  /**
   *  Request of pagination and sorting.
   */
  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      code?: string;
      source?: string;
      target?: "customer" | "seller" | "administrator";
      content?: IHubPushMessageContent.ISearch;
    }
    export type SortableColumns =
      | "message.code"
      | "message.source"
      | "message.created_at"
      | "content.title";
  }

  /**
   *  CSV upload information of metadata records.
   */
  export interface ICsvUpload {
    file: File;
  }

  /**
   *  Creation information of the push message metadata.
   */
  export interface ICreate {
    /**
     *  Content of the push message.
     */
    content: IHubPushMessageContent.ICreate;

    /**
     *  Identifier code of the push message.
     */
    code: string;

    /**
     *  Source table name occurring the push message event.
     */
    source: string;

    /**
     *  Target actor kind to receive.
     */
    target: "customer" | "seller" | "administrator";
  }
}
