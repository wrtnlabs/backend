import { IStudioMetaChatSessionMessageBase } from "./IStudioMetaChatSessionMessageBase";

export type IStudioMetaChatSessionMessageOfTalk =
  IStudioMetaChatSessionMessageBase<"user" | "agent", "talk">;
