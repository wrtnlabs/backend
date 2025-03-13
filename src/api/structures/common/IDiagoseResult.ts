import { IDiagnosis } from "./IDiagnosis";

export type IDiagnoseResult<T> =
  | IDiagnoseResult.ISuccess<T>
  | IDiagnoseResult.IFailure;
export namespace IDiagnoseResult {
  export interface ISuccess<T> {
    success: true;
    data: T;
  }
  export interface IFailure {
    success: false;
    errors: IDiagnosis[];
    /**
     *  @internal
     */
    status?: number | null;
  }
}
