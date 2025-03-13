import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";
import { IHubMemberElite } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMemberElite";
import { IHubMemberVillain } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMemberVillain";

/**
 * Customer information managed by the administrator.
 *
 * `IAdminCustomerAggregate` is an entity that visualizes customer information
 * managed by the administrator.
 *
 * You can use {@link IHubMember.created_at} to express the member conversion date.
 *
 * - If {@link IHubMember.seller} is not null, it means that it is a Seller member.
 * - If {@link IHubMemberVillain} is not null, it means that it is a Villain member.
 * - If {@link IHubMemberElite} is not null, it means that it is an Elite member.
 *
 * @author Asher
 */
export interface IAdminCustomerAggregate {
  id: string & tags.Format<"uuid">;

  /**
   * General member information.
   */
  member: IHubMember;

  /**
   * Villain member information.
   */
  villain: null | IHubMemberVillain[];

  /**
   * Elite Member Information.
   */
  elite: null | IHubMemberElite[];
}

export namespace IAdminCustomerAggregate {
  /**
   * Summary information.
   */
  export interface ISummary
    extends Pick<IAdminCustomerAggregate, "id" | "member"> {
    /**
     * Villain member information.
     */
    villain: null | IHubMemberVillain;

    /**
     * Elite Member Information.
     */

    elite: null | IHubMemberElite;
  }

  export interface IRequest extends IPage.IRequest {
    /**
     * Search information.
     */
    search?: IRequest.ISearch;

    /**
     * Sort criteria.
     */
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }

  export namespace IRequest {
    export interface ISearch {
      id?: string & tags.Format<"uuid">;
      ids?: string[];
      channel_codes?: string[];
      email?: string;
      nickname?: string;
      member?: {
        type?: MemberType;
        from?: string & tags.Format<"date">;
        to?: string & tags.Format<"date">;
        access_type?: AccessType;
      };
    }

    export type MemberType = "members" | "sellers";

    export type AccessType = "elite" | "villain" | "none";

    export type SortableColumns = "member.created_at" | "member.nickname";
  }
}
