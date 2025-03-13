import { tags } from "typia";

/**
 * Sandbox information for secret variable values registered to a studio account.
 *
 * `IStudioAccountSecretValueSandbox` is information that separates
 * {@link IStudioAccountSecretValue secret variable value} registered to
 * {@link IStudioAccount studio account} into a sandbox.
 *
 * @author Samchon
 */
export interface IStudioAccountSecretValueSandbox {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Key value, i.e. variable name.
   */
  key: string;

  /**
   * Identifier code.
   *
   * Usually used are account emails or IDs of linked target services.
   */
  code: string;

  /**
   * Secret value.
   */
  value: string;

  /**
   * Scope of authority.
   */
  scopes: string[];
}
export namespace IStudioAccountSecretValueSandbox {
  /**
   * Information on changing secret variable values.
   */
  export interface IUpdate {
    /**
     * The value to change.
     */
    value: string;
  }

  /**
   * Emplace request info.
   *
   * Emplace request info of secret value for a specific record unit.
   *
   * Currently, the manual sandbox emplacing is used only in the
   * workflow editor. In other words, it is used from the workflow
   * snapshot entity.
   */
  export interface IEmplace {
    secret_id: string & tags.Format<"uuid">;
    value_id: string & tags.Format<"uuid">;
  }
}
