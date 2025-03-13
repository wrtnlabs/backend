import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubCustomer } from "../../hub/actors/IHubCustomer";

/**
 * API key of LLM provider.
 *
 * `IStudioAccountLlmKey` is a structure representing an API key of LLM provider
 * configured to the {@link IStudioAccount studio account}.
 *
 * @author Samchon
 */
export interface IStudioAccountLlmKey {
  id: string & tags.Format<"uuid">;

  /**
   * Customer information that registered the variable.
   */
  customer: IHubCustomer;

  /**
   * Identifier code of the API key.
   */
  code: string;

  /**
   * The provider name.
   */
  provider: IStudioAccountLlmKey.Provider;

  /**
   * Creation time of the record.
   */
  created_at: string & tags.Format<"date-time">;

  /**
   * Last update time of the record.
   */
  updated_at: string & tags.Format<"date-time">;
}
export namespace IStudioAccountLlmKey {
  /**
   * Type of LLM providers.
   */
  export type Provider = "openai" | "anthropic";

  /**
   * Request information for retrieving a list of LLM API keys.
   */
  export interface IRequest extends IPage.IRequest {}

  /**
   * LLM API key emplacement information.
   *
   * The system does not provide any way to getting the secret key value
   * of the `IStudioAccountLlmKey` record due to security reason. Because of
   * the same reason, `IStudioAccountLlmKey` also does not provide any way to
   * update the secret key value.
   *
   * Instead, the system provides a way to emplace the secret key value
   * through the `IStudioAccountLlmKey.IEmplace` structure. The LLM API key
   * would be always overwritten by the emplacement.
   */
  export interface IEmplace {
    /**
     * Identifier code.
     */
    code: string;

    /**
     * The provider name.
     */
    provider: IStudioAccountLlmKey.Provider;

    /**
     * API key value.
     */
    value: string;
  }

  /**
   * Reference of the LLM API key.
   */
  export interface IReference {
    /**
     * Belonged account's {@link IStudioAccount.code}.
     */
    account_code: string;

    /**
     * Identifier code of the API key.
     */
    code: string;
  }
}
