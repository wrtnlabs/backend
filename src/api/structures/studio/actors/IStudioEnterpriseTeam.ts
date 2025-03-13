import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IRecordMerge } from "../../common/IRecordMerge";
import { IStudioEnterprise } from "./IStudioEnterprise";

/**
 * Team information within the company.
 *
 * `IStudioEnterpriseTeam` is an entity that represents a team within the
 * {@link IStudioEnterprise company}. The team is
 * {@link IStudioEnterpriseTeamCompanion members} and has
 * {@link IStudioEnterpriseEmployee employees}, and can be active by receiving
 * {@link IStudioRepositoryAccess access} from the {@link IStudioRepository repository}
 * owned by the company as a team unit.
 *
 * @author Samchon
 */
export interface IStudioEnterpriseTeam extends IStudioEnterpriseTeam.ISummary {}
export namespace IStudioEnterpriseTeam {
  /**
   * Team reverse reference information.
   */
  export interface IInvert extends ISummary {
    /**
     * Affiliated company information.
     */
    enterprise: IStudioEnterprise.ISummary;
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
      code?: string;
      name?: string;
    }
    export type SortableColumns = "team.code" | "team.name" | "team.created_at";
  }

  /**
   * Summary information about the team.
   */
  export interface ISummary {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Identifier of the Discriminated Union type.
     */
    type: "team";

    /**
     * The team identifier code.
     *
     * Part of the path in the URL address of the team page.
     */
    code: string;

    /**
     * Team name.
     */
    name: string;

    /**
     * The date and time the record was created.
     */
    created_at: string & tags.Format<"date-time">;
  }
  export interface ICreate {
    /**
     * The team identifier code.
     *
     * Part of the path in the URL address of the team page.
     */
    code: string;

    /**
     * Team name.
     */
    name: string;
  }
  export interface IUpdate {
    /**
     * Team name.
     */
    name: string;
  }

  /**
   * Team Merge Information.
   *
   * If an employee belongs to both the teams being merged, the role of the team
   * being merged is maintained, and the role of the team being merged is discarded.
   */
  export interface IMerge extends IRecordMerge {}
}
