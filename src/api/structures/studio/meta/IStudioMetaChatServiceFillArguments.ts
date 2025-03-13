import { IChatGptSchema } from "@samchon/openapi";

import { IStudioMetaChatServiceOperation } from "./IStudioMetaChatServiceOperation";

export interface IStudioMetaChatServiceFillArguments {
  operation: IStudioMetaChatServiceOperation;

  /**
   * Parameters schema.
   */
  parameters: IChatGptSchema.IParameters;

  /**
   * LLM's self-constructed schema and value information.
   *
   * If this value is `null`, it must be constructed by a human with 100% purity.
   */
  llm: null | {
    /**
     * Schema information that LLM needs to configure.
     */
    parameters: IChatGptSchema.IParameters;

    /**
     * The arguments that LLM composed.
     */
    arguments: Record<string, any>;
  };
}
export namespace IStudioMetaChatServiceFillArguments {
  export type IResponse = IAccept | IReject;
  export interface IAccept {
    determinant: "accept";
    arguments: Record<string, any>;
  }
  export interface IReject {
    determinant: "reject";
  }
}
