import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IStudioAccountSecret } from "./IStudioAccountSecret";

/**
 * Global variable value information registered in the studio account.
 *
 * `IStudioAccountSecretValue` is an entity that embodies the individual values
 * of the {@link IStudioAccountSecret secret variable set} registered in the
 * {@link IStudioAccount studio account}.
 *
 * And the secret variable referred to here refers to authentication keys or passwords
 * used for linking with other applications. For reference, the main purpose
 * of the secret variable is to be used as a parameter or some property inserted into
 * a connector or workflow function within the {@link IStudioWorkflow workflow} program.
 *
 * It is identified through {@link IAstWorkflowSecretIdentifier} and is mainly used to
 * store authentication keys such as Google or Facebook.
 *
 * And for this purpose, {@link IStudioAccountSecretValue.value variable value}
 * is encrypted and stored in the DB.
 *
 * @author Samchon
 */
export interface IStudioAccountSecretValue {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Identifier code.
   *
   * Usually used are account emails or IDs of linked target services.
   */
  code: string;

  /**
   * Scope of authority.
   */
  scopes: string[];

  /**
   * Secret value.
   */
  value: string;

  /**
   * The date and time the record was created.
   */
  created_at: string & tags.Format<"date-time">;

  /**
   * Date and time of record modification.
   */
  updated_at: string & tags.Format<"date-time">;

  /**
   * Expiration date and time of the variable value.
   */
  expired_at: null | (string & tags.Format<"date-time">);
}
export namespace IStudioAccountSecretValue {
  /**
   * Request to create a secret variable.
   */
  export interface ICreate {
    /**
     * Identifier code.
     *
     * Usually used are account emails or IDs of linked target services.
     */
    code: string;

    /**
     * Variable values. Stored encrypted.
     */
    value: string;

    /**
     * Scope of authority.
     */
    scopes: string[];

    /**
     * Expiration date and time of the variable value.
     */
    expired_at: null | (string & tags.Format<"date-time">);
  }

  /**
   * Request to modify secret variables.
   */
  export interface IUpdate {
    /**
     * Identifier code.
     *
     * Usually used are account emails or IDs of linked target services.
     */
    code?: string;

    /**
     * Variable values. Stored encrypted.
     */
    value?: string;

    /**
     * Scope of authority.
     */
    scopes?: string[];

    /**
     * Expiration date and time of the variable value.
     */
    expired_at?: null | (string & tags.Format<"date-time">);
  }

  /**
   * Summary of dereferencing information for secret variables.
   */
  export interface IInvertSummary {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Identifier code.
     *
     * Usually used are account emails or IDs of linked target services.
     */
    code: string;

    /**
     * Scope of authority.
     */
    scopes: string[];

    /**
     * Parents Secret Information.
     */
    secret: IStudioAccountSecret.IInvert;

    /**
     * The date and time the record was created.
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * Date and time of record modification.
     */
    updated_at: string & tags.Format<"date-time">;

    /**
     * Expiration date and time of the variable value.
     */
    expired_at: null | (string & tags.Format<"date-time">);
  }

  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      code?: string;
      secret?: IStudioAccountSecret.IRequest.ISearch;
    }
    export type SortableColumns =
      | "value.created_at"
      | "value.updated_at"
      | "value.expired_at"
      | "value.code"
      | "value.sequence"
      | IStudioAccountSecret.IRequest.SortableColumns;
  }
}
