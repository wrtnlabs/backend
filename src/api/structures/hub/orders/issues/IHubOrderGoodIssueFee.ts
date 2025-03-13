import { tags } from "typia";

import { IPage } from "../../../common/IPage";
import { IHubOrderGoodIssueFeeAccept } from "./IHubOrderGoodIssueFeeAccept";

/**
 * Offering a fee for resolving an issue.
 *
 * {@link IHubOrderGoodIssueFee} refers to the fee that the seller offers
 * to the customer when resolving an issue regarding a product ordered by the customer.
 * This usually occurs when the customer requests additional work such as
 * customization or modification through the issue.
 *
 * The customer may pay the fee in response, refuse it, or, in some cases,
 * negotiate the price.
 *
 * If the seller wants to adjust the price in response, the current record can be
 * deleted and a new fee record can be reissued.
 *
 * @author Samchon
 */
export interface IHubOrderGoodIssueFee {
  /**
   * Primary key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Amount of the attorney's fee.
   */
  value: number & tags.Minimum<0>;

  /**
   * {@link IHubOrderGoodIssueFeeAccept}
   * Value exists only if the issue fee is accepted.
   */
  accept: IHubOrderGoodIssueFeeAccept | null;

  /**
   * The time at which the fee was charged.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubOrderGoodIssueFee {
  /**
   * Input information for claiming the fee.
   *
   * The value exists only if the fee is accepted.
   */
  export interface ICreate {
    /**
     * Amount of the attorney's fee.
     */
    value: number & tags.Minimum<0>;

    /**
     * The date and time the record was created.
     */
    created_at: string & tags.Format<"date-time">;
  }

  /**
   * Search for fee information or page information.
   */
  export interface IRequest extends IPage.IRequest {
    /**
     * Search criteria.
     */
    search?: IRequest.ISearch;

    /**
     * Sorting conditions.
     */
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      /**
       * Minimum fee amount.
       */
      min_price?: number;

      /**
       * Maximum amount of attorney fees.
       */
      max_price?: number;
    }
    export type SortableColumns = "fee.price" | "fee.created_at";
  }
}
