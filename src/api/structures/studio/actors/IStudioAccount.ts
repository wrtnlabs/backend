import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubMember } from "../../hub/actors/IHubMember";
import { IStudioEnterprise } from "./IStudioEnterprise";

/**
 * Account entity.
 *
 * `IStudioAccount` is an entity that embodies an account in the studio system.
 * An account is a single entity with a unique identifier code, and can own
 * {@link IStudioRepository repositories}. For example, if the address of a specific
 * repository in GitHub is https://github.com/samchon/typia, "samchon" is the identifier
 * of the account, and it is the owner of the repository called "typia."
 *
 * And the account referred to here does not necessarily refer to a person. The account owner
 * may be a {@link IHubMember member}, but it may also be a {@link IStudioEnterprise company}.
 * For example, in the case of https://github.com/Microsoft/TypeScript, the account owner
 * is not a person, but the company "Microsoft."
 *
 * In addition, an account can change its owner. And when the owner changes, it is also
 * possible for the subject to change from an individual to a company. For example,
 * an account and repository that started as an individual will become successful and
 * then be promoted to a company in the future.
 *
 * @author Samchon
 */
export interface IStudioAccount extends IStudioAccount.ISummary {}

export namespace IStudioAccount {
  /**
   * Back-reference information for an account.
   *
   * Information that does not have owner information for the account,
   * i.e. information that is back-referenced from the owner.
   */
  export interface IInvert {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Identifier code.
     */
    code: string;

    /**
     * Account creation date and time.
     */
    created_at: string;
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
      type?: "member" | "enterprise";
      code?: string;
    }

    export type SortableColumns = "account.code" | "account.created_at";
  }

  /**
   * Summary information about your account.
   */
  export interface ISummary extends IInvert {
    /**
     * Owner information.
     */
    owner: IHubMember | IStudioEnterprise.IInvertFromAccount;
  }

  /**
   * Account creation information.
   */
  export interface ICreate {
    /**
     * Identifier code.
     */
    code: string;
  }

  /**
   * Modification information for your account.
   */
  export interface IUpdate {
    /**
     * New identifier code.
     */
    code: string;
  }
}
