import typia from "typia";

export interface IAverage {
  mean: number;
  count: number & typia.tags.Type<"uint32">;
  stdev: number;
}
