import { tags } from "typia";

import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

/**
 * Villain member among general member accounts.
 *
 * `IHubMemberVillain` is an entity added when {@link IHubMember customer}
 * registers as a blacklist member in this system.
 *
 * Note that only administrators can register as villain members.
 *
 * @author Asher
 */
export interface IHubMemberVillain extends IHubMemberVillain.IInvert {}

export namespace IHubMemberVillain {
  /**
   * Villain member reverse reference information.
   */
  export interface IInvert {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Identifier of the Discriminated Union type.
     */
    type: "villain";

    /**
     * Disinformation about members registered as villain members.
     */
    member: IHubMember.IInvert;

    /**
     * The registered administrator's reverse information.
     */
    administrator: IHubAdministrator.IInvert;

    /**
     * Reason for registration.
     *
     * If `null`, it means that the administrator did not enter a reason
     * when registering.
     */
    reason: null | string;

    /**
     * Registration date and time.
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * Date of deletion.
     */
    deleted_at: null | (string & tags.Format<"date-time">);
  }

  /**
   * Villain member input information.
   */
  export interface ICreate {
    /**
     * {@link IHubMember.id} of the member to be promoted to Villain Member.
     */
    member_id: string & tags.Format<"uuid">;

    /**
     * Reason for promotion to villain member.
     *
     * Can be null.
     */
    reason: null | string;
  }
}
