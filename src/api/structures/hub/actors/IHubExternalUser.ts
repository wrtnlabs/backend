import { tags } from "typia";

import { IHubExternalUserContent } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUserContent";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

import { IHubCitizen } from "./IHubCitizen";

/**
 * External user information.
 *
 * `IHubExternalUser` is an entity for when this system connects to an external
 * service and needs to accept their users as {@link IHubCustomer customers}
 * of this service.
 *
 * For reference, customers who access from an external service must have this
 * record, and the external service user is identified through the two properties
 * {@link application} and {@link uid}.
 *
 * If a customer who accessed from an external service completes
 * {@link IHubCitizen real-name authentication} from this service, the external
 * service user starts with the real-name authentication completed whenever he or
 * she re-accesses this service and issues a new customer authentication token.
 * This is the same when signing up for {@link IHubMember} membership.
 *
 * And {@link IHubExternalUser.ICreate.password} is the password issued by the
 * external service system to the user (so-called permanent user authentication token),
 * and is never the actual user password. However, this is to determine whether
 * a customer who entered the same {@link application} and {@link uid} as
 * the current external system user is a valid external system user or a violation.
 *
 * In addition, additional information received from an external service can be
 * recorded in the {@link data} field in JSON format.
 *
 * @author Samchon
 */
export interface IHubExternalUser {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Citizen authentication information.
   */
  citizen: null | IHubCitizen;

  /**
   * Identifier code of the external service.
   */
  application: string;

  /**
   * User identifier key.
   */
  uid: string;

  /**
   * User nickname on external services.
   */
  nickname: string;

  /**
   * Additional information from external services.
   */
  data: any;

  /**
   * External user information details.
   *
   * Used only when received from WRTN SSO.
   */
  content: IHubExternalUserContent | null;

  /**
   * Member ID.
   *
   * If you are not registered or logged in as an external user,
   * this property value is `null`.
   */
  member_id: null | (string & tags.Format<"uuid">);

  /**
   * Record creation date and time.
   *
   * The date and time when an external user first accessed this service.
   */
  created_at: string & tags.Format<"date-time">;
}

export namespace IHubExternalUser {
  export interface ICreate {
    /**
     * Identifier code of the external service.
     */
    application: string;

    /**
     * An identifier key for that user in an external service.
     */
    uid: string;

    /**
     * User nickname on external services.
     */
    nickname: string;

    /**
     * System password for external service users.
     *
     * This is a password issued by the external service to the user,
     * and is not the actual user password.
     *
     * It is only used to determine whether a customer who entered the same
     * {@link application} and {@link code} as the current external system user
     * is a valid external system user or a violation.
     */
    password: string;

    /**
     * Citizen authentication information.
     */
    citizen: null | IHubCitizen.ICreate;

    /**
     * External user information details.
     *
     * Used only when received from WRTN SSO.
     */
    content: IHubExternalUserContent.ICreate | null;

    /**
     * Additional information from external services.
     */
    data: any;
  }

  /**
   * OAuth Providers.
   *
   * External Application name equals to OAuth Provider name.
   */
  export type IApplicationParam = "google" | "kakao" | "naver" | "apple";

  /**
   * Input information of OAuth Login.
   */
  export interface IOAuthLoginInput {
    /**
     * Authorization code to get access token.
     */
    authorization_code: string;

    /**
     * Redirect URI.
     */
    redirect_uri: string & tags.Format<"iri">;
  }

  /**
   * Input information to get Authentication URL.
   */
  export interface IGetAuthUrlInput {
    /**
     * Scope for access permission.
     */
    scope?: string;

    /**
     * Redirect URI.
     */
    redirect_uri: string & tags.Format<"iri">;
  }

  /**
   * Authentication URL information.
   */
  export interface IGetAuthUrlOutput {
    /**
     * Authentication URL.
     */
    auth_url: string & tags.Format<"iri">;
  }
}
