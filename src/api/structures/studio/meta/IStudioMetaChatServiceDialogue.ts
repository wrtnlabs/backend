/**
 * LLM Meta Chat's conversation information.
 *
 * `IStudioMetaChatServiceDialogue` is a union type that visualizes LLM Meta Chat's
 * conversation information. Currently, only text conversation information types
 * exist, but voice, image, or complex types may be added in the future.
 *
 * @author Samchon
 */
export type IStudioMetaChatServiceDialogue =
  IStudioMetaChatServiceDialogue.IText;
export namespace IStudioMetaChatServiceDialogue {
  /**
   * Text conversation information.
   */
  export interface IText {
    type: "text";
    text: string;
  }
}
