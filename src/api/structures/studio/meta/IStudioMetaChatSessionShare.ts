import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubCustomer } from "../../hub/actors/IHubCustomer";
import { IStudioMetaChatSession } from "./IStudioMetaChatSession";

/**
 * A record of sharing a Meta LLM chat session.
 *
 * {@link IStudioMetaChatSessionShare} is a record of sharing a
 * {@link IStudioMetaChatSession Meta LLM chat session}'s
 * {@link IStudioMetaChatMessage message contents}.
 *
 * @author Samchon
 */
export interface IStudioMetaChatSessionShare {
  /**
   * Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * The customer who've issued the sharing record.
   */
  customer: IHubCustomer;

  /**
   * Target message's {@link IStudioMetaChatMessage.id}
   * if you want to restrict the sharing to a specific message as endpoint.
   */
  message_id: null | (string & tags.Format<"uuid">);

  /**
   * Title of the sharing record.
   */
  title: null | string;

  /**
   * The shared {@link IStudioMetaChatSession Meta LLM chat session}.
   */
  session: IStudioMetaChatSession;

  /**
   * Creation time of the record.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IStudioMetaChatSessionShare {
  /**
   * Page and search request information.
   */
  export interface IRequest extends IPage.IRequest {
    /**
     * Target session's {@link IStudioMetaChatSession.id}.
     *
     * If configure as `null`, all sharing records will be retrieved.
     */
    session_id: null | (string & tags.Format<"uuid">);
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      title?: string;
    }
    export type SortableColumns = "share.title" | "share.created_at";
  }

  /**
   * Creation information of the sharing record.
   */
  export interface ICreate {
    /**
     * Title of the sharing record.
     */
    title: null | string;

    /**
     * Target session's {@link IStudioMetaChatSession.id}.
     */
    session_id: string & tags.Format<"uuid">;

    /**
     * Target message's {@link IStudioMetaChatSessionMessage.id}
     * if you want to restrict the sharing to a specific message as endpoint.
     */
    message_id: null | (string & tags.Format<"uuid">);
  }

  /**
   * Update information of the sharing record.
   */
  export interface IUpdate {
    /**
     * Target message's {@link IStudioMetaChatSessionMessage.id}
     * if you want to restrict the sharing to a specific message as endpoint.
     */
    message_id?: null | (string & tags.Format<"uuid">);

    /**
     * Title of the sharing record.
     */
    title?: null | string;
  }
}
