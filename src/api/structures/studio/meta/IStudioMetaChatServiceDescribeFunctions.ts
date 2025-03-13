import { IStudioMetaChatServiceCompleteFunction } from "./IStudioMetaChatServiceCompleteFunction";

export interface IStudioMetaChatServiceDescribeFunctions {
  completes: IStudioMetaChatServiceCompleteFunction[];
  text: string;
}
