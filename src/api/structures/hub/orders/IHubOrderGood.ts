import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubSale } from "../sales/IHubSale";
import { IHubCartCommodity } from "./IHubCartCommodity";
import { IHubOrder } from "./IHubOrder";
import { IHubOrderPrice } from "./IHubOrderPrice";

/**
 * Individual product information that constitutes an order.
 *
 * {@link IHubOrderGood} is an entity that represents each product
 * ordered by a customer, and the record is created when
 * {@link IHubCartCommodity product raw materials} in the shopping cart are
 * upgraded to products due to a customer's order request.
 *
 * And {@link IHubOrderGood} is a concept that corresponds to the
 * snapshot unit of the product, whether it is {@link IHubCartCommodity} or not.
 *
 * In addition, {@link IHubOrderGood} is the most basic unit for the process
 * after the order, that is, after-sales service (A/S). For example, the unit
 * where a customer issues an issue for an ordered product or requests a refund
 * is {@link IHubOrderGood}.
 *
 * @author Asher
 */
export interface IHubOrderGood {
  /**
   * Primary key.
   */
  id: string & tags.Format<"uuid">;

  /**
   *  장바구니의 {@link IHubCartCommodity}
   */
  commodity: IHubCartCommodity;

  /**
   * Product pricing information.
   */
  price: IHubOrderPrice.ISummary;

  /**
   * The time of commencement of the order contract.
   *
   * Unlike the time of confirmation of the order, the effective date
   * can be postponed later than that. And the effective date of the contract
   * can be continuously edited until it arrives.
   *
   * Also, the monthly fixed fee is calculated based on the commencement date.
   *
   * Please note that after the customer purchases the seller's API, the
   * process of reviewing and developing it is necessary, so the effective date
   * of the original contract cannot help but be postponed later than the
   * order confirmation.
   */
  opened_at: null | (string & tags.Format<"date-time">);

  /**
   * The termination date of the contract.
   *
   * However, the termination date of the contract cannot be immediate. From
   * the time of contract initiation, it can only be cancelled after a period
   * of at least 1 month has passed. And if the contract has already been
   * initiated, it can also only be terminated in 1-month units.
   */
  closed_at: null | (string & tags.Format<"date-time">);
}

export namespace IHubOrderGood {
  /**
   * Backreference information for individual product information.
   */
  export interface IInvert extends IHubOrderGood {
    /**
     * Reverse reference information for the order.
     */
    order: IHubOrder.IInvert;
  }

  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      order?: Omit<IHubOrder.IRequest.ISearch, "sale">;
      sale?: IHubSale.IRequest.ISearch;
    }
    export type SortableColumns =
      | "order.created_at"
      | "order.publish.created_at"
      | "good.opened_at"
      | "good.closed_at"
      | IHubSale.IRequest.SortableColumns;
  }

  /**
   * Enter information about the individual items that make up your order.
   */
  export interface ICreate {
    /**
     * Commodity identifier.
     */
    commodity_id: string & tags.Format<"uuid">;
  }

  export interface IOpen {
    /**
     * The start date of the order contract.
     *
     * Set the start date of the order contract.
     *
     * Unlike the time of confirmation of the order, the effective date can
     * be postponed later than that. And the effective date of the contract
     * can be continuously edited until it arrives.
     *
     * Also, the monthly fixed fee is calculated based on the start date.
     *
     * Please note that after the customer purchases the seller's API, the
     * process of reviewing and developing it is necessary, so the effective
     * date of the original contract cannot help but be postponed later than
     * the order confirmation.
     */
    opened_at: null | (string & tags.Format<"date-time">) | "now";
  }

  export interface IClose {
    /**
     * The end date of the order contract.
     *
     * Set the end date of the order contract.
     *
     * However, the end date of the contract cannot be set immediately.
     * From the start date of the contract, it can only be cancelled after a
     * period of at least 1 month. And if the contract has already been started,
     * it can only be terminated in 1-month units.
     */
    closed_at: null | (string & tags.Format<"date-time">);
  }

  export interface IExecute {
    /**
     * {@link IHubSaleUnit.id} of the target unit.
     */
    unit_id: string & tags.Format<"uuid">;

    /**
     * METHOD for calling API.
     */
    method: "head" | "get" | "post" | "put" | "patch" | "delete";

    /**
     * PATH for API calls.
     */
    path: string;

    /**
     * A list of parameters to be passed to the function.
     */
    arguments: any[];
  }

  export interface IWorkflow {
    /**
     * {@link IHubSaleUnit.id} of the target unit.
     */
    unit_id: string & tags.Format<"uuid">;

    /**
     * {@link IStudioWorkflowStandalone.id} of the target node.
     */
    node_id: string & tags.Format<"uuid">;
  }
}
