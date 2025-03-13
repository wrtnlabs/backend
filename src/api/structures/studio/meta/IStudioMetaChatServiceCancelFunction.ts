import { IStudioMetaChatServiceOperation } from "./IStudioMetaChatServiceOperation";

export interface IStudioMetaChatServiceCancelFunction {
  /**
   * The canceled operation.
   */
  operation: IStudioMetaChatServiceOperation;

  /**
   * Reason of the function canceling.
   */
  reason: string;
}
