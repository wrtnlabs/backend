import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubCustomer } from "../actors/IHubCustomer";
import { IHubSale } from "../sales/IHubSale";
import { IHubOrderGood } from "./IHubOrderGood";
import { IHubOrderPrice } from "./IHubOrderPrice";
import { IHubOrderPublish } from "./IHubOrderPublish";

/**
 * This is an entity that visualizes order request information.
 *
 * `IHubOrder` is an entity that visualizes the customer's order "request"
 * information. Therefore, this entity is different from {@link IHubOrderPublish},
 * which indicates the order confirmation stage, so be careful about this.
 * In other words, the existence of an `IHubOrder` record does not mean that
 * the order is complete.
 *
 * In addition, as soon as a customer places an order, all of the targeted
 * {@link IHubCartCommodity shopping cart raw materials} are upgraded to
 * order products, and {@link IHubOrderGood} records are created under
 * {@link IHubOrder}.
 *
 * Of course, not all product raw materials in the target shopping cart become
 * order products, and only those selected by the customer become
 * {@link IHubOrderGood}.
 *
 * @author Samchon
 */
export interface IHubOrder extends IHubOrder.IInvert {
  /**
   * Information about the individual products that make up your order.
   */
  goods: IHubOrderGood[] & tags.MinItems<1>;

  /**
   * Order price information.
   *
   * Mostly {@link IHubSaleUnitStockPrice.fixed fixed cost},
   * but may sometimes include a {@link IHubCoupon discount coupon} that
   * affects variable cost.
   */
  price: IHubOrderPrice.ISummary;
}

export namespace IHubOrder {
  /**
   * Order information dereference information.
   */
  export interface IInvert {
    /**
     * Primary key
     */
    id: string & tags.Format<"uuid">;

    /**
     * Orderer
     */
    customer: IHubCustomer;

    /**
     * Confirmation information for your order.
     */
    publish: null | IHubOrderPublish;

    /**
     * Record creation date and time
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * Order cancellation date.
     *
     * Cancellation is only possible before it takes effect.
     */
    cancelled_at: null | (string & tags.Format<"date-time">);
  }

  /**
   * View order information list or page information.
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
      from?: string & tags.Format<"date-time">;
      to?: string & tags.Format<"date-time">;
      sale?: IHubSale.IRequest.ISearch;
      published?: boolean;
      expired?: boolean;
    }

    export type SortableColumns =
      | "order.created_at"
      | "order.publish.created_at";
  }

  /**
   * Order entry information.
   */
  export interface ICreate {
    /**
     * Product information.
     */
    goods: IHubOrderGood.ICreate[];
  }

  /**
   * Information on order expiration date extension.
   */
  export interface IRefresh {
    /**
     * Order Expiration Date
     */
    expired_at: null | (string & tags.Format<"date-time">);
  }
}
