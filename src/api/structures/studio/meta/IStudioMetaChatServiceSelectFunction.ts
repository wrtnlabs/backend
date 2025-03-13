import { IStudioMetaChatServiceOperation } from "./IStudioMetaChatServiceOperation";

export interface IStudioMetaChatServiceSelectFunction {
  /**
   * The selected operation.
   */
  operation: IStudioMetaChatServiceOperation;

  /**
   * Reason of the function selecting.
   */
  reason: string;
}
