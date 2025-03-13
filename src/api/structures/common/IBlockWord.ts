import typia from "typia";

export namespace IBlockWord {
  export interface IContent {
    word: string;
    range: IRange;
  }

  export interface IRange {
    start: number & typia.tags.Type<"uint64">;
    end: number & typia.tags.Type<"uint64">;
  }

  export interface IAllRequest {
    text: string;
    language: LanguageType;
    filterType: [FilterType];
  }

  export interface IAll {
    blockwords: IContent[];
  }

  export interface IBatchRequest {
    text: string[];
    language: LanguageType;
    filterType: [FilterType];
  }

  export interface IBatch {
    blockwords: IContent[][];
  }

  export type LanguageType = "ko" | "jp";
  export type FilterType = "BLOCKWORD_REGEX";
}
