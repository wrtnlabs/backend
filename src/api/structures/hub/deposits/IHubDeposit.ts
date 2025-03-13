import { tags } from "typia";

import { IPage } from "../../common/IPage";

/**
 * This is an entity that visualizes the specifications for deposit and
 * withdrawal in the exchange.
 *
 * {@link IHubDeposit} is not {@link IHubDepositHistory}, which means the deposit
 * and withdrawal history of the deposit, but is simply metadata that specifies
 * the specifications for the scenario in which the deposit is deposited and
 * withdrawn. Please note that this gen-hub cannot pay cash immediately at the
 * time of the customer's purchase of the goods (the time of the API call) due to
 * the nature of the API as a transaction object.
 *
 * Instead, this system charges the customer with a deposit and deducts it
 * every time the API is called.
 *
 * @author Samchon
 */
export interface IHubDeposit {
  /**
   *  basic
   */
  id: string & tags.Format<"uuid">;

  /**
   * Identifier Code
   */
  code: string;

  /**
   * The source table that causes deposits and withdrawals of deposits.
   */
  source: string;

  /**
   * Deposit and withdrawal direction
   *
   * 1: Deposit -1: Deduct
   */
  direction: 1 | -1;

  /**
   * Create a record
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubDeposit {
  /**
   * View deposit list and page information
   */
  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      source?: string;
      code?: string;
      direction?: 1 | -1;
    }
    export type SortableColumns =
      | "deposit.source"
      | "deposit.code"
      | "deposit.direction";
  }

  /**
   * Deposit creation information.
   */
  export interface ICreate {
    /**
     * Identifier Code
     */
    code: string;

    /**
     * The source table that causes deposits and withdrawals of deposits.
     */
    source: string;

    /**
     * Deposit and withdrawal direction
     *
     * 1: Deposit -1: Deduct
     */
    direction: 1 | -1;
  }
}
