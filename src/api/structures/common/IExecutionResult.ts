export type IExecutionResult<T> =
  | IExecutionResult.ISuccess<T>
  | IExecutionResult.IFailure;
export namespace IExecutionResult {
  export interface ISuccess<T> {
    success: true;
    value: T;
  }
  export interface IFailure {
    success: false;
    error: any;
  }
}
