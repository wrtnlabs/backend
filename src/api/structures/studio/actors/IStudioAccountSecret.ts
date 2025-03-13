import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubCustomer } from "../../hub/actors/IHubCustomer";
import { IStudioAccountSecretValue } from "./IStudioAccountSecretValue";

/**
 * Secret variable set information registered to the studio account.
 *
 * `IStudioAccountSecret` is an entity that visualizes a set of secret variables
 * registered to {@link IStudioAccount studio account}. It is a concept that collects
 * multiple {@link values variable values} for one secret {@link key}. And the secret
 * variable referred to here refers to authentication keys or passwords used for
 * linking with other applications.
 *
 * For reference, the main purpose of the secret variable is to be used as a parameter
 * or some property inserted into a connector or workflow function within the
 * {@link IStudioWorkflow workflow} program. It is identified through
 * {@link IAstWorkflowSecretIdentifier} and is mainly used to store authentication keys
 * such as Google or Facebook.
 *
 * And for this purpose, {@link IStudioAccountSecretValue.value variable value}
 * is encrypted and stored in the DB.
 *
 * @author Samchon
 */
export interface IStudioAccountSecret extends IStudioAccountSecret.IInvert {
  /**
   * Customer information that registered the variable.
   */
  customer: IHubCustomer;

  /**
   * A list of variable values.
   */
  values: IStudioAccountSecretValue[];

  /**
   * Detailed description of the variables.
   */
  description: null | string;
}
export namespace IStudioAccountSecret {
  /**
   * Page and search request information.
   */
  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      key?: string;
      title?: string;
      description?: string;
      title_or_description?: string;
    }
    export type SortableColumns =
      | "secret.key"
      | "secret.title"
      | "secret.created_at"
      | "secret.updated_at";
  }

  /**
   * Summary information about the script.
   */
  export interface ISummary extends IInvert {
    /**
     * Number of variables.
     */
    count: number & tags.Type<"uint32">;
  }

  /**
   * Request to create a secret.
   */
  export interface ICreate {
    /**
     * Key value, i.e. variable name.
     */
    key: string;

    /**
     * A list of variable values.
     *
     * Stored encrypted in the DB.
     */
    values: IStudioAccountSecretValue.ICreate[];

    /**
     * A brief title for the variable.
     */
    title: null | string;

    /**
     * Detailed description of the variable.
     */
    description: null | string;
  }

  /**
   * Request a secret update.
   */
  export interface IUpdate {
    /**
     * A brief title for the variable.
     */
    title?: null | string;

    /**
     * Detailed description of the variable.
     */
    description?: null | string;

    /**
     * A list of new variable values to be configured.
     *
     * All previous variables are deleted and new variable values are configured.
     */
    values?: IStudioAccountSecretValue.ICreate[];

    /**
     * Expiration date and time of the variable value.
     */
    expired_at?: null | (string & tags.Format<"date-time">);
  }

  /**
   * Secret's reverse reference information.
   */
  export interface IInvert {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Key value, i.e. variable name.
     */
    key: string;

    /**
     * A title for the variable.
     */
    title: null | string;

    /**
     * The date and time the record was created.
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * Date and time of record modification.
     */
    updated_at: string & tags.Format<"date-time">;
  }
}
