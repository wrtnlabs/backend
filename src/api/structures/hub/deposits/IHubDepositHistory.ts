import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubCitizen } from "../actors/IHubCitizen";
import { IHubDeposit } from "./IHubDeposit";

/**
 * {@link IHubDepositHistory} is an entity that visualizes the customer's
 * deposit and withdrawal history.
 *
 * It can be considered a kind of accounting ledger table.
 *
 * @author Samchon
 */
export interface IHubDepositHistory {
  /**
   * Primary key
   */
  id: string & tags.Format<"uuid">;

  /**
   * IHub Citizen {@link IHubCitizen}
   */
  citizen: IHubCitizen;

  /**
   * Deposit Meta Information {@link IHubDeposit}
   */
  deposit: IHubDeposit;

  /**
   * ID of the source record that generated the deposit/withdrawal
   */
  source_id: string & tags.Format<"uuid">;

  /**
   * The amount of deposit/withdrawal.
   *
   * Must be a positive number, and whether or not a deposit/withdrawal
   * is made can be seen in {@link IHubDeposit.direction}.
   *
   * If you want to express the deposit/withdrawal values as positive/negative
   * numbers, you can also multiply this field value by the
   * {@link IHubDeposit.direction} value.
   */
  value: number & tags.ExclusiveMinimum<0>;

  /**
   * Balance after deposit changes.
   */
  balance: number;

  /**
   * Record creation date and time
   */
  created_at: string & tags.Format<"date-time">;
}

export namespace IHubDepositHistory {
  /**
   * Deposit deposit/withdrawal history inquiry and page information
   */
  export interface IRequest extends IPage.IRequest {
    /**
     * Search Conditions
     */
    search?: IRequest.ISearch;

    /**
     * Sorting Conditions
     */
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }

  export namespace IRequest {
    export interface ISearch {
      /**
       * Search for deposit metadata.
       */
      deposit?: IHubDeposit.IRequest.ISearch;

      /**
       * Attributable Citizen ID
       */
      citizen_id?: string & tags.Format<"uuid">;

      from?: string & tags.Format<"date-time">;
      to?: string & tags.Format<"date-time">;
      minimum?: number & tags.Minimum<0>;
      maximum?: number & tags.Minimum<0>;
    }

    export type SortableColumns =
      | "history.created_at"
      | "history.value"
      | IHubDeposit.IRequest.SortableColumns;
  }

  /**
   *  @internal
   */
  export interface ICreate {
    /**
     * Deposit Identifier Code
     */
    deposit_code: string;

    /**
     * ID of the source record that generated the deposit/withdrawal
     */
    source_id: string & tags.Format<"uuid">;

    /**
     * The amount of deposit/withdrawal.
     *
     * Must be a positive number, and whether or not a deposit/withdrawal is made can be seen in {@link IHubDeposit.direction}.
     *
     * If you want to express the deposit/withdrawal values as positive/negative numbers, you can also multiply this field value by the {@link IHubDeposit.direction} value.
     */
    value: number & tags.Minimum<0>;
  }
}
