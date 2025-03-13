import { tags } from "typia";

import { IStudioAccountLlmKey } from "../actors/IStudioAccountLlmKey";
import { IStudioMetaChatServiceDialogue } from "./IStudioMetaChatServiceDialogue";
import { IStudioMetaChatServiceTokenUsage } from "./IStudioMetaChatServiceTokenUsage";
import { IStudioMetaChatSession } from "./IStudioMetaChatSession";

/**
 * A set of functions that the Meta LLM server provides to the client.
 *
 * `IStudioMetaChatService` is an interface that defines a set of functions that the
 * **server** provides to the Meta LLM client. Through this interface, the Meta LLM client
 * RPCs (Remote Procedure Calls) the server's `IStudioMetaChatService` functions.
 *
 * Note that the client must immediately call the {@link initialize} function after
 * connecting to the Meta LLM server. If the client skips the {@link initialize} function
 * call and tries to start with {@link talk}, the function call will fail.
 *
 * @author Samchon
 */
export interface IStudioMetaChatService {
  /**
   * Issue/Restore/Initialize Chat Session.
   *
   * After the client connects to the Meta LLM server, it must first call to
   * issue {@link IStudioMetaChatSession chat session} or
   * restore an existing session. If you skip the {@link initialize} function call and
   * try to start with {@link talk} right away, the function call will fail.
   *
   * The returned session is issued and returned as a new session if you connected with
   * the new chat session issuance API, or restored and returned as an existing session
   * if you connected with the API that continues an existing session.
   *
   * - {@link osApi.functional.studio.customers.meta.chat.sessions.start}
   * - {@link osApi.functional.studio.customers.meta.chat.sessions.restart}
   */
  initialize(
    props?: Partial<IStudioMetaChatService.IProps>,
  ): Promise<IStudioMetaChatSession>;

  /**
   * User speaks to Meta LLM.
   *
   * Must call {@link initialize} function when first connecting.
   *
   * @param dialogue Conversation information
   */
  talk(dialogue: IStudioMetaChatServiceDialogue): Promise<void>;

  /**
   * Abort current action of Meta LLM.
   *
   * User requests to abort the Meta LLM's currently working process,
   * and resume from the user's turn. If it succeeded,
   * {@link IStudioMetaChatListener.listenable} will be called.
   *
   * By the way, as this `IStudioMetaChatservice.abort()` function requires
   * locking the Meta LLM's process mutex, its response may not be immediate,
   * but be delayed.
   *
   * In other words, you have to wait for the response.
   */
  abort(): Promise<void>;

  /**
   * Get LLM Cost of The chat session.
   *
   * This function return the total cost and cost by models.
   */
  getTokenUsage(): Promise<IStudioMetaChatServiceTokenUsage>;
}
export namespace IStudioMetaChatService {
  /**
   * Properties of the {@link IStudioMetaChatService.initialize} function.
   */
  export interface IProps {
    /**
     * LLM key reference.
     *
     * If this property has not been configured, the customer can say only
     * 5 conversations. And if the customer wants to say more, the customer
     * have to re-connect with the {@link IStudioAccountLlmKey} setup.
     */
    llm_key?: IStudioAccountLlmKey.IReference | null;
  }

  export interface IStartQuery extends IQuery {
    /**
     * Enforce Session ID.
     *
     * If you fill in this property value, you can enforce the value
     * {@link IStudioMetaChatSession.id}.
     */
    id?: string & tags.Format<"uuid">;

    title?: string | null;

    good_ids?: null | Array<string & tags.Format<"uuid">>;
  }

  export interface IQuery {
    /**
     * Whether to activate mockup.
     *
     * If this property value is set to `true`, a mockup session is provided instead
     * of an actual Meta session. This is a feature that exists for the convenience
     * of front/client development.
     *
     * However, be careful not to distribute it by setting `mock: true` when distributing it.
     */
    mock?: boolean;

    /**
     * Client's time zone.
     *
     * @default Asia/Seoul
     */
    timezone?: string;
  }
}
