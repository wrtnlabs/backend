import { tags } from "typia";

import { IHubChannel } from "../systematic/IHubChannel";
import { IHubCitizen } from "./IHubCitizen";
import { IHubExternalUser } from "./IHubExternalUser";
import { IHubMember } from "./IHubMember";

/**
 * Customer information, but based on access criteria, not people.
 *
 * `IHubCustomer` is an entity that literally embodies the information of
 * those who participated in the market as customers. `IHubCustomer` issues
 * a new record for each access, even if it is the same person.
 *
 * The first purpose is to track the customer inflow path in detail, and the
 * second is to prevent cases where the same person enters as a non-member,
 * diligently puts {@link IHubSale items} in the
 * {@link IHubCartCommodity shopping cart}, and only then does
 * {@link IHubCitizen real name authentication} or
 * {@link IHubMember membership registration/login} at the moment of payment.
 * Lastly, the same person may access {@link IHubExternalUser external service}
 * to make a purchase, create multiple accounts to make a purchase, be a non-member
 * and then only authenticate their real name to make a purchase, and sometimes
 * become a member and act as a {@link IHubSeller seller} or
 * {@link IHubAdministrator administrator}, etc. This is to accurately track the
 * activities that a person performs on the exchange in various ways.
 *
 * Therefore, `IHubCustomer` can have multiple records with the same
 * {@link IHubCitizen} or {@link IHubMember} and {@link IHubExternalUser}. Also,
 * if a customer signs up for membership after authenticating their real name or
 * signs up for our service after being an external service user, all related
 * records are changed at once. This makes it possible to identify and track
 * customers very systematically.
 *
 * @author Samchon
 */
export interface IHubCustomer extends IHubCustomer.IInvert {
  /**
   * Discriminator for the discriminated union type.
   */
  type: "customer";

  /**
   * Membership information.
   *
   * If you have not registered or logged in, this information is `null`.
   */
  member: null | IHubMember;

  /**
   * Citizen Information.
   *
   * Whether the customer has authenticated himself or has done so in the past.
   */
  citizen: null | IHubCitizen;
}
export namespace IHubCustomer {
  /**
   * Customer's reverse reference information.
   *
   * This information is used in the reverse reference information of
   * the administrator and seller.
   *
   * - {@link IHubAdministrator.IInvert}
   * - {@link IHubSeller.IInvert}
   */
  export interface IInvert {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Channel affiliation information.
     *
     * Which channel is the customer?
     */
    channel: IHubChannel;

    /**
     * External user information.
     *
     * Applies to customers who access from external services.
     */
    external_user: null | IHubExternalUser;

    /**
     * The connection address.
     *
     * Same value as {@link window.location.href}.
     */
    href: string & tags.Format<"uri">;

    /**
     * Referrer URL.
     *
     * Same value as {@link window.document.referrer}.
     */
    referrer: string & (tags.MaxLength<0> | tags.Format<"uri">);

    /**
     * The connecting IP address.
     */
    ip: string & (tags.Format<"ipv4"> | tags.Format<"ipv6">);

    /**
     * Whether read-only or not.
     */
    readonly: boolean;

    /**
     * Language code.
     */
    lang_code: LanguageType | null;

    /**
     * Synonyms for record creation date and time, access date and time.
     */
    created_at: string & tags.Format<"date-time">;
  }

  export type LanguageType =
    | "ar" // 아랍어
    | "en" // 영어
    | "hi" // 힌디어
    | "ja" // 일본어
    | "ko" // 한국어
    | "zh" // 중국어
    | "zh-CN" // 중국어(간체)
    | "zh-TW" // 중국어(번체)
    | (string & {});

  export interface ICreate {
    /**
     * {@link IHubChannel.code code} of the channel you are a customer of.
     *
     * Which channel are you a customer of?
     */
    channel_code: string;

    /**
     * External user information.
     *
     * Applies to customers who access from external services.
     */
    external_user: null | IHubExternalUser.ICreate;

    /**
     * The connection address.
     *
     * Same value as {@link window.location.href}.
     */
    href: string & tags.Format<"uri">;

    /**
     * Referrer URL.
     *
     * Same value as {@link window.document.referrer}.
     */
    referrer: string & (tags.MaxLength<0> | tags.Format<"uri">);

    /**
     * Connection IP address.
     *
     * Occasionally, when server-side rendering and server-side API calls are
     * made, such as `next.js`, the client IP acquired by this backend server may
     * not actually belong to the customer, but to another server (`next.js`).
     *
     * This `IHubCustomer.ICreate.ip` is a field to prepare for cases where API calls
     * are made by server-side rendering, and to accurately record the client's
     * actual IP. If this is not the case, do not enter this property value,
     * or assign a `null` value.
     */
    ip?: string & (tags.Format<"ipv4"> | tags.Format<"ipv6">);

    /**
     * Whether read-only or not.
     */
    readonly?: boolean;

    /**
     * Language code.
     */
    lang_code?: LanguageType | null;

    /**
     * Set token expiration time.
     */
    expired_at?: null | (string & tags.Format<"date-time">);
  }

  export interface IUpdate {
    /**
     * Language code.
     */
    lang_code?: LanguageType | null;
  }

  export interface IAuthorized extends IHubCustomer {
    /**
     * Header setting value.
     *
     * The client can assign this value to {@link IConnection.headers}.
     *
     * However, this process is automatically performed when calling the
     * relevant SDK function.
     */
    setHeaders: { Authorization: string };

    /**
     * Token information.
     */
    token: IToken;
  }

  /**
   * Token information.
   */
  export interface IToken {
    /**
     * Access token.
     */
    access: string;

    /**
     * Renewal token.
     */
    refresh: string;

    /**
     * Token expiration time.
     */
    expired_at: null | (string & tags.Format<"date-time">);

    /**
     * Token renewal time.
     */
    refreshable_until: null | (string & tags.Format<"date-time">);
  }

  /**
   * DTO when trying to renew token
   */
  export interface IRefresh {
    /**
     * The renewal token value.
     */
    value: string;
  }

  export interface IBeta {
    email: string & tags.Format<"email">;
  }

  /**
   * Information needed for sign in.
   */
  export interface IOAuthLogin
    extends Omit<IHubCustomer, "external_user" | "member"> {
    /**
     * External User.
     */
    external_user: IHubExternalUser;

    /**
     * Member.
     */
    member: IHubMember;
  }

  /**
   * Email Verification Type.
   */
  export type IEmailVerificationType = "sign-up";

  /**
   * Input to send email.
   */
  export interface IEmail {
    /**
     * Email.
     */
    email: string & tags.Format<"email">;

    /**
     * Email Verification Type
     */
    type: IEmailVerificationType;
  }

  /**
   * Input to verify email.
   */
  export interface IVerifyEmail {
    /**
     * verification code.
     */
    code: string;

    /**
     * Email Verification Type
     */
    type: IEmailVerificationType;

    /**
     * Email.
     */
    email: string & tags.Format<"email">;
  }
}
