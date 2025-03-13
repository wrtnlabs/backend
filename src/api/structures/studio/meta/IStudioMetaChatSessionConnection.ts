import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubCustomer } from "../../hub/actors/IHubCustomer";

/**
 * Meta LLM chat session connection information.
 *
 * `IStudioMetaChatSessionConnection` is an entity that visualizes the connection
 * information of {@link IHubCustomer customer} to the
 * {@link IStudioMetaChatSession Meta LLM chat session}.
 *
 * That is, whenever a customer connects to a Meta LLM chat session using the
 * WebSocket protocol, an `IStudioMetaChatSessionConnection` record is created for
 * that session, and when the customer disconnects the WebSocket, the time is recorded
 * in {@link disconnected_at}.
 *
 * @author Samchon
 */
export interface IStudioMetaChatSessionConnection {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Chat session connection customer information.
   */
  customer: IHubCustomer;

  /**
   * Connection time.
   */
  connected_at: string & tags.Format<"date-time">;

  /**
   * Disconnection time.
   */
  disconnected_at: null | (string & tags.Format<"date-time">);
}
export namespace IStudioMetaChatSessionConnection {
  /**
   * Page and search request information.
   */
  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      from?: string & tags.Format<"date-time">;
      to?: string & tags.Format<"date-time">;
    }
    export type SortableColumns =
      | "connection.connected_at"
      | "connection.disconnected_at";
  }
}
