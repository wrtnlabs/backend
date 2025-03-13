import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IStudioMetaChatSessionMessageOfCancelFunction } from "./IStudioMetaChatSessionMessageOfCancelFunction";
import { IStudioMetaChatSessionMessageOfCompleteFunction } from "./IStudioMetaChatSessionMessageOfCompleteFunction";
import { IStudioMetaChatSessionMessageOfDescribeFunctionCalls } from "./IStudioMetaChatSessionMessageOfDescribeFunctionCalls";
import { IStudioMetaChatSessionMessageOfFillArguments } from "./IStudioMetaChatSessionMessageOfFillArguments";
import { IStudioMetaChatSessionMessageOfSelectFunction } from "./IStudioMetaChatSessionMessageOfSelectFunction";
import { IStudioMetaChatSessionMessageOfTalk } from "./IStudioMetaChatSessionMessageOfTalk";

/**
 * Meta LLM chat session message information.
 *
 * `IStudioMetaChatSessionMessage` is an entity that records messages that occurred in a
 * {@link IStudioMetaChatSession Meta LLM chat session}. To be precise, it records which
 * {@link IStudioMetaChatSessionConnection WebSocket connection} within the chat session
 * it occurred in.
 *
 * And since our Meta LLM chat session uses TGrid's
 * [RPC (Remote Procedure Call)](https://tgrid.com/docs/remote-procedure-call/)
 * concept in the WebSocket protocol, this `IStudioMetaChatSessionMessage` is also an entity
 * that encompasses {@link IStudioMetaChatSessionMessageData}, the history information for
 * RPC function calls.
 *
 * @author Samchon
 */
export type IStudioMetaChatSessionMessage =
  | IStudioMetaChatSessionMessageOfCancelFunction
  | IStudioMetaChatSessionMessageOfCompleteFunction
  | IStudioMetaChatSessionMessageOfDescribeFunctionCalls
  | IStudioMetaChatSessionMessageOfFillArguments
  | IStudioMetaChatSessionMessageOfSelectFunction
  | IStudioMetaChatSessionMessageOfTalk;
export namespace IStudioMetaChatSessionMessage {
  /**
   * Page and search request information.
   */
  export interface IRequest extends IPage.IRequest {
    /**
     * {@link IStudioMetaChatSessionConnection.id} of the WebSocket connection.
     *
     * You can search and retrieve messages limited to a specific websocket connection.
     */
    connection_id?: string & tags.Format<"uuid">;
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      from?: string & tags.Format<"date-time">;
      to?: string & tags.Format<"date-time">;
    }
    export type SortableColumns = "message.created_at" | "message.completed_at";
  }
}
