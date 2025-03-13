import { IAgenticaTokenUsage } from "@agentica/core";

export interface IStudioMetaChatServiceTokenUsage {
  /**
   * Aggregated token usage.
   */
  aggregate: IStudioMetaChatServiceTokenUsage.IComponent;

  /**
   * Token uasge of initializer agent.
   */
  initialize: IStudioMetaChatServiceTokenUsage.IComponent;

  /**
   * Token usage of function selector agent.
   */
  select: IStudioMetaChatServiceTokenUsage.IComponent;

  /**
   * Token usage of function canceler agent.
   */
  cancel: IStudioMetaChatServiceTokenUsage.IComponent;

  /**
   * Token usage of function caller agent.
   */
  call: IStudioMetaChatServiceTokenUsage.IComponent;

  /**
   * Token usage of function calling describer agent.
   */
  describe: IStudioMetaChatServiceTokenUsage.IComponent;
}
export namespace IStudioMetaChatServiceTokenUsage {
  export interface IComponent extends IAgenticaTokenUsage.IComponent {
    input: IInput;
    output: IOutput;
  }
  export interface IInput extends IAgenticaTokenUsage.IInput {
    price: number;
  }
  export interface IOutput extends IAgenticaTokenUsage.IOutput {
    price: number;
  }
}
