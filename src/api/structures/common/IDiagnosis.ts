import { ErrorCode } from "../../constants/ErrorCode";

/**
 *  Result of diagnosis.
 *
 *  A diagnosis describing which error has been occurred.
 *
 *  @author Samchon
 */
export interface IDiagnosis<Code extends ErrorCode = ErrorCode> {
  /**
   *  Access path of variable which caused the problem.
   */
  accessor?: string;

  /**
   *  Error code.
   */
  code: Code;

  /**
   *  Message of diagnosis.
   */
  message: string;
}
