import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IStudioEnterpriseEmployee } from "./IStudioEnterpriseEmployee";
import { IStudioEnterpriseTeam } from "./IStudioEnterpriseTeam";

/**
 * Information about the members of a team within a company.
 *
 * `IStudioEnterpriseTeamCompanion` is an entity that visualizes which
 * {@link IStudioEnterpriseEmployee employees} participate as members in each
 * {@link IStudioEnterpriseTeam team} that constitutes a {@link IStudioEnterprise company}.
 *
 * Note that employees participate as members of a team and are given a certain role,
 * which may be different from their original position. Also, employees of a company
 * can belong to multiple teams at the same time. This is similar to how one
 * {@link IHubMember member} could be assigned as an employee to multiple companies
 * at the same time.
 *
 * @author Samchon
 */
export interface IStudioEnterpriseTeamCompanion
  extends IStudioEnterpriseTeamCompanion.ISummary {
  /**
   * Target employee information.
   */
  employee: IStudioEnterpriseEmployee;
}
export namespace IStudioEnterpriseTeamCompanion {
  /**
   * Information about your teammates' roles within the team.
   */
  export type Role = "chief" | "manager" | "member" | "observer";

  /**
   * Reverse reference information from staff.
   */
  export interface IInvert extends ISummary {
    /**
     * Team affiliation information.
     */
    team: IStudioEnterpriseTeam.ISummary;
  }

  /**
   * Page and search request information.
   */
  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      roles?: Role[];
      from?: string & tags.Format<"date-time">;
      to?: string & tags.Format<"date-time">;
    }
    export type SortableColumns = "companion.role" | "companion.created_at";
  }

  /**
   * Summary information about your teammates.
   */
  export interface ISummary {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Roles assigned to teammates.
     */
    role: Role;

    /**
     * Date of record creation.
     *
     * Date of first appointment as teammate.
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * Record modification date.
     *
     * Synonymous with role change date.
     */
    updated_at: string & tags.Format<"date-time">;
  }

  /**
   * Enter (appoint) teammate information.
   */
  export interface ICreate {
    /**
     * Target Employee's {@link IStudioEnterpriseEmployee.id}
     */
    employee_id: string & tags.Format<"uuid">;

    /**
     * Role to be assigned.
     */
    role: Role;
  }

  /**
   * Information on changing the role of your teammate.
   */
  export interface IUpdate {
    /**
     * Role to change.
     */
    role: Role;
  }
}
