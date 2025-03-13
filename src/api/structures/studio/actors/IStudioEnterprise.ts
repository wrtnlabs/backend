import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IStudioAccount } from "./IStudioAccount";
import { IStudioEnterpriseTeam } from "./IStudioEnterpriseTeam";

/**
 * Corporate entity.
 *
 * `IStudioEnterprise` is an entity that represents a company, and literally means
 * a subject participating in the studio system as a company unit. And in the case of
 * a company, unlike {@link IHubMember members}, it must have a {@link IStudioAccount account}.
 *
 * In addition, a company has {@link IStudioEnterpriseEmployee employees} and
 * {@link IStudioEnterpriseTeam teams} composed of them as sub-entities. And among
 * these teams, its {@link IStudioEnterpriseTeamCompanion members} can have the same
 * {@link IStudioRepositoryAccess access rights} of the
 * {@link IStudioRepository repository} belonging to the company as a group.
 *
 * @author Samchon
 */
export interface IStudioEnterprise extends IStudioEnterprise.ISummary {
  /**
   * Team list.
   */
  teams: IStudioEnterpriseTeam[];
}
export namespace IStudioEnterprise {
  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      account?: string;
      name?: string;
    }
    export type SortableColumns =
      | "enterprise.name"
      | "enterprise.created_at"
      | "account.code";
  }

  /**
   * Summary information about the company.
   */
  export interface ISummary {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Identifier of the Discriminated Union type.
     */
    type: "enterprise";

    /**
     * Your account information.
     */
    account: IStudioAccount.IInvert;

    /**
     * Company name.
     */
    name: string;

    /**
     * The date and time the record was created.
     */
    created_at: string & tags.Format<"date-time">;
  }

  /**
   * Corporate reference information from accounts.
   */
  export interface IInvertFromAccount {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Identifier of the Discriminated Union type.
     */
    type: "enterprise";

    /**
     * Company name.
     */
    name: string;

    /**
     * Account creation date and time.
     */
    created_at: string;
  }

  /**
   * Creation information of the company.
   */
  export type ICreate = ICreate.INew | ICreate.IMigrate;
  export namespace ICreate {
    export interface INew extends IBase {
      /**
       * Whether to transfer the account.
       *
       * A method of issuing a new account to the company rather than transferring
       * the customer's account to the company.
       */
      migrate: false;

      /**
       * A new account code to be issued to the company.
       */
      account: string;
    }
    export interface IMigrate extends IBase {
      /**
       * Whether to transfer the account.
       *
       * If this value is set to `true`, the company will not issue a new account,
       * but will take over the current member's account as is. And the new account
       * issued with the code written in {@link new_account_for_customer} will be given
       * to the current member.
       */
      migrate: true;

      /**
       * After transferring the account to the company, the new account code to be
       * issued to the customer.
       *
       * The company takes over the current customer's account as is. And a new account
       * is issued with the code written in this property `new_account_for_customer`.
       * Of course, if this value is `null`, the customer becomes "no account" after
       * transferring the account to the company.
       */
      new_account_for_customer: null | string;
    }
    interface IBase {
      /**
       * Company name.
       */
      name: string;
    }
  }

  /**
   * Editorial information for the company.
   */
  export interface IUpdate {
    /**
     * Company name.
     */
    name: string;
  }
}
