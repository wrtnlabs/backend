import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubMember } from "../../hub/actors/IHubMember";
import { IStudioEnterpriseTeamCompanion } from "./IStudioEnterpriseTeamCompanion";

/**
 * Employee entity within the company.
 *
 * `IStudioEnterpriseEmployee` is an entity that represents an employee belonging to
 * {@link IStudioEnterprise company}. Employees belong to
 * {@link IStudioEnterpriseTeam team} within the company, and work as
 * {@link IStudioEnterpriseTeamCompanion members}, and are granted
 * {@link IStudioRepositoryAccess permission} from the company's
 * {@link IStudioRepository repository} as a team unit.
 *
 * Please note that only those who have registered as {@link IHubMember members}
 * in this studio system can be appointed as employees, and it is possible for one person
 * to belong to multiple companies as an employee at the same time.
 *
 * @author Samchon
 */
export interface IStudioEnterpriseEmployee
  extends IStudioEnterpriseEmployee.ISummary {
  /**
   * List of team affiliation information.
   */
  teams: IStudioEnterpriseTeamCompanion.IInvert[];
}
export namespace IStudioEnterpriseEmployee {
  /**
   * Roles that can be assigned to employees.
   *
   * - `owner`: Owner of the company. Has all permissions
   * - `manager`: Manager of the company, has permissions for general members
   * - `member`: General members
   * - `observer`: Viewer of the team, read-only
   */
  export type Title = "owner" | "manager" | "member" | "observer";

  /**
   * Page and search request information.
   */
  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      title?: Title;
      approved?: null | boolean;
      from?: string & tags.Format<"date-time">;
      to?: string & tags.Format<"date-time">;
    }
    export type SortableColumns =
      | "employee.title"
      | "employee.created_at"
      | "employee.approved_at";
  }

  /**
   * Summary information about the staff.
   */
  export interface ISummary {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Identifier of the Discriminated Union type.
     */
    type: "employee";

    /**
     * Affiliated member information.
     */
    member: IHubMember;

    /**
     * Positions that can be assigned to employees.
     *
     * - `owner`: Owner of the company. Has all permissions
     * - `manager`: Manager of the company, has permissions for general members
     * - `member`: General members
     * - `observer`: Viewer of the team, read-only
     */
    title: Title;

    /**
     * Employee invitation date and time.
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * Date and time of employee permission modification.
     */
    updated_at: string & tags.Format<"date-time">;

    /**
     * Date and time of employee invitation approval.
     */
    approved_at: null | (string & tags.Format<"date-time">);
  }

  /**
   * Staff appointment information.
   */
  export interface ICreate {
    /**
     * Target member's {@link IHubMember.id}
     */
    member_id: string & tags.Format<"uuid">;

    /**
     * The position to be granted.
     */
    title: Title;
  }

  /**
   * Staff editing information.
   */
  export interface IUpdate {
    /**
     * Position to change.
     */
    title: Title;
  }
}
