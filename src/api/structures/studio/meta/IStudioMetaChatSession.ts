import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubCustomer } from "../../hub/actors/IHubCustomer";
import { IHubOrderGood } from "../../hub/orders/IHubOrderGood";
import { IStudioMetaChatServiceTokenUsage } from "./IStudioMetaChatServiceTokenUsage";
import { IStudioMetaChatSessionConnection } from "./IStudioMetaChatSessionConnection";
import { IStudioMetaChatSessionMessage } from "./IStudioMetaChatSessionMessage";
import { IStudioMetaChatSessionMessageOfTalk } from "./IStudioMetaChatSessionMessageOfTalk";

/**
 * Meta LLM chat session information.
 *
 * `IStudioMetaChatSession` is an entity that visualizes the Meta LLM chat
 * session and its history.
 *
 * Therefore, `IStudioMetaChatSession` contains the most basic information of
 * the chat session, such as {@link customer opener customer} and
 * {@link created_at opening time}, and the sub-entities
 * {@link IStudioMetaChatSessionConnection} and
 * {@link IStudioMetaChatSessionMessage} contain the session connection information
 * and the mutually transmitted and received message history, respectively.
 *
 * For reference, our Meta LLM chat session uses the WebSocket protocol and
 * [TGrid](https://tgrid.com/docs/remote-procedure-call/)'s RPC
 * (Remote Procedure Call) concept. Therefore, the sub-entity
 * {@link IStudioMetaChatSessionConnection} records the client's
 * connection/disconnection information to the WebSocket server, and
 * {@link IStudioMetaChatSessionMessage} records the RPC function calls and
 * return history between the server and client.
 *
 * @author Samchon
 */
export interface IStudioMetaChatSession {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Information about the customer who created the chat session.
   */
  customer: IHubCustomer;

  /**
   * Chat room title.
   */
  title: string | null;

  /**
   * List of goods.
   *
   * The goods that are providing the functions to call.
   */
  goods: IHubOrderGood[];

  /**
   * The most recent connection information.
   *
   * If a session was opened only with an HTTP request and no connection
   * was made, `null`.
   */
  connection: IStudioMetaChatSessionConnection | null;

  /**
   * The last conversation message history.
   *
   * If there is no conversation message from this session yet, `null`.
   */
  last_message: IStudioMetaChatSessionMessageOfTalk | null;

  /**
   * Total LLM cost aggregation.
   */
  token_usage: IStudioMetaChatServiceTokenUsage;

  /**
   * The date and time the record was created.
   */
  created_at: string & tags.Format<"date-time">;

  /**
   * Date and time of record modification.
   */
  updated_at: string & tags.Format<"date-time">;

  /**
   * Date and time fixed to the top of the list.
   */
  pinned_at: null | (string & tags.Format<"date-time">);
}
export namespace IStudioMetaChatSession {
  /**
   * Page and search request information.
   */
  export interface IRequest extends IPage.IRequest {
    pinned?: boolean | null;
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      from?: string & tags.Format<"date-time">;
      to?: string & tags.Format<"date-time">;
    }
    export type SortableColumns = "session.created_at" | "session.updated_at";
  }

  /**
   * Information about opening a chat session.
   */
  export interface ICreate {
    /**
     * @internal
     */
    id?: string & tags.Format<"uuid">;

    /**
     * The title of the chat session.
     *
     * If omit, the title just becomes `null`.
     */
    title?: string | null;

    /**
     * List of target goods' {@link IHubOrderGood.id}.
     *
     * Note that, only the goods that are in the contract is allowed.
     */
    good_ids?: null | Array<string & tags.Format<"uuid">>;
  }

  /**
   * Information on requesting corrections.
   */
  export interface IUpdate {
    /**
     * The title of the chat session.
     */
    title?: string | null;
  }
}
