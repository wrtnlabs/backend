import { tags } from "typia";

import { IStudioMetaChatServiceOperation } from "./IStudioMetaChatServiceOperation";

export interface IStudioMetaChatServiceCompleteFunction {
  /**
   * Primary Key.
   */
  id: string;

  /**
   * The executed operation.
   */
  operation: IStudioMetaChatServiceOperation;

  /**
   * A keyworded object representing the arguments.
   */
  arguments: Record<string, any>;

  /**
   * The value returned as a result of a function call.
   */
  value: any;

  /**
   * Function call time.
   */
  created_at: string & tags.Format<"date-time">;

  /**
   * The time when the function call was completed.
   *
   * If this property value is `null`, it means that the connection to the target
   * function (API operation) itself failed.
   */
  completed_at: null | (string & tags.Format<"date-time">);

  /**
   * Return status value.
   *
   * If this attribute value is `null`, it means that the connection to the target
   * function (API operation) itself has failed. On the other hand, if the connection
   * itself is successful, the response status of the HTTP protocol is recorded
   * regardless of the success or failure of the function call {@link success}.
   */
  status: number | null;
}
