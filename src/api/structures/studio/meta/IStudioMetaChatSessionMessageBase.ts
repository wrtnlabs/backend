import { tags } from "typia";

import { IStudioMetaChatListener } from "./IStudioMetaChatListener";

export interface IStudioMetaChatSessionMessageBase<
  Speaker extends "user" | "agent",
  Type extends Extract<
    keyof IStudioMetaChatListener,
    | "talk"
    | "cancelFunction"
    | "selectFunction"
    | "fillArguments"
    | "completeFunction"
    | "describeFunctionCalls"
  >,
> {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * {@link IStudioMetaChatSessionConnection.id} of the session connection.
   *
   * If you need detailed information about the session connection,
   *
   * you can directly query {@link {@link IStudioMetaChatSessionConnection} through
   * the provided SDK API.
   */
  connection_id: string & tags.Format<"uuid">;

  /**
   * Who is the speaker?
   *
   * It means who is the originator of the current message, and conversely, it also means
   * the type of RPC function caller.
   *
   * That is, if this attribute value is "user", the client called the server's
   * {@link IStudioMetaChatService} RPC function, and conversely, if this attribute value
   * is "agent", the server called the client's {@link IStudioMetaChatListener} RPC function.
   *
   * - user: Human, the customer
   * - agent: LLM Agent
   */
  speaker: Speaker;

  /**
   * Diescriminator type of the data property.
   */
  type: Type;

  /**
   * Arguments data.
   *
   * Arguments of RPC (Remote Procedure Call).
   */
  arguments: Parameters<IStudioMetaChatListener[Type]>;

  /**
   * Return value.
   *
   * Return value of RPC (Remote Procedure Call).
   */
  value: EscapePromise<ReturnType<IStudioMetaChatListener[Type]>>;

  /**
   * The date and time the message was created.
   */
  created_at: string & tags.Format<"date-time">;

  /**
   * The time when the message (function call) is completed.
   */
  completed_at: null | (string & tags.Format<"date-time">);
}

type EscapePromise<T extends Promise<any>> =
  T extends Promise<infer U> ? U : never;
