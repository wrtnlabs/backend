import { tags } from "typia";

import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

/**
 * Elite member among general member accounts.
 *
 * `IHubMemberElite` is an entity added to this system when
 * {@link IHubMember customer} is promoted to elite member.
 *
 * Note that only administrators can promote elite members.
 *
 * @author Asher
 */
export interface IHubMemberElite extends IHubMemberElite.IInvert {}

export namespace IHubMemberElite {
  /**
   * Elite member reverse reference information.
   */
  export interface IInvert {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Identifier of the Discriminated Union type.
     */
    type: "elite";

    /**
     * Information about members who have been promoted to elite members.
     */
    member: IHubMember.IInvert;

    /**
     * Information about the promoted manager.
     */
    administrator: IHubAdministrator.IInvert;

    /**
     * Reason for promotion.
     *
     * If `null`, it means the administrator did not enter a reason for promotion.
     */
    reason: null | string;

    /**
     * Promotion date and time.
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * Date of deletion.
     */
    deleted_at: null | (string & tags.Format<"date-time">);
  }

  /**
   * Elite member input information.
   */
  export interface ICreate {
    /**
     * {@link IHubMember.id} of the member you wish to promote to Elite Membership.
     */
    member_id: string & tags.Format<"uuid">;

    /**
     * Reason for promotion to elite membership.
     *
     * Can be null.
     */
    reason: null | string;
  }
}
