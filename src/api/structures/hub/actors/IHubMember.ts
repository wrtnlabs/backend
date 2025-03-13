import { tags } from "typia";

import { IStudioAccount } from "../../studio/actors/IStudioAccount";
import { IHubAdministrator } from "./IHubAdministrator";
import { IHubCitizen } from "./IHubCitizen";
import { IHubMemberEmail } from "./IHubMemberEmail";
import { IHubSeller } from "./IHubSeller";

/**
 * General member account.
 *
 * `IHubMember` is an entity that represents a case where a
 * {@link IHubCustomer customer} registers as a general member in this system.
 *
 * Note that if the value of {@link IHubMember.seller} or
 * {@link IHubMember.administrator} is not `null`, it means that the member also
 * registers and acts as a seller and administrator.
 *
 * Conversely, if you want a structure that reversely references member and
 * customer information from administrators and sellers, use the structure
 * below instead.
 *
 * - {@link IHubAdministrator.IInvert}
 * - {@link IHubSeller.IInvert}
 *
 * @author Samchon
 */
export interface IHubMember extends IHubMember.IInvert {
  /**
   * Citizen Information.
   *
   * Limited to members who have completed identity verification.
   */
  citizen: null | IHubCitizen;

  /**
   * If this member is also registered as an administrator.
   */
  administrator: null | IHubAdministrator;

  /**
   * If this member is also registered as a seller.
   */
  seller: null | IHubSeller;
}
export namespace IHubMember {
  /**
   * General member reverse reference information.
   *
   * This information is used in the reverse reference information of
   * administrators and sellers.
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
     * Identifier of the Discriminated Union type.
     */
    type: "member";

    /**
     * Email list.
     */
    emails: IHubMemberEmail[] & tags.MinItems<1>;

    /**
     *  nickname.
     */
    nickname: string;

    /**
     * Profile background color.
     */
    profile_background_color: MemberColorType | null;

    /**
     * Studio account.
     */
    account: null | IStudioAccount.IInvert;

    /**
     * The date and time the record was created.
     */
    created_at: string & tags.Format<"date-time">;
  }

  /**
   * Profile background color type.
   */
  export type MemberColorType =
    | "primary"
    | "gray"
    | "inspired_red"
    | "apricot"
    | "yellow"
    | "green"
    | "blue"
    | "violet"
    | "pink";

  /**
   * Membership information.
   */
  export interface IJoin extends ILogin {
    /**
     *  nickname.
     */
    nickname: string;

    /**
     * Citizen information.
     *
     * Only for those who sign up by authenticating themselves.
     */
    citizen: null | IHubCitizen.ICreate;

    /**
     * Email Verification Code.
     */
    code?: string;
  }

  /**
   * Login information.
   */
  export interface ILogin {
    /**
     * Email address.
     */
    email: string & tags.Format<"email">;

    /**
     * Password.
     */
    password: null | (string & tags.Pattern<"^[A-Za-z0-9@$!%*#?&^]{8,15}$">);
  }

  /**
   * Password change request information.
   */
  export interface IPasswordChange {
    /**
     * Existing password.
     */
    oldbie: string;

    /**
     * New password.
     */
    newbie: string & tags.Pattern<"^[A-Za-z0-9@$!%*#?&^]{8,15}$">;
  }

  /**
   * Password reset request information.
   */
  export interface IPasswordReset {
    /**
     * Email address to receive the initialization email.
     *
     * Must match one of the member's email addresses.
     */
    email: string & tags.Format<"email">;
  }

  /**
   * Update request information.
   */
  export interface IUpdate {
    /**
     * nickname.
     */
    nickname: string;
  }
}
