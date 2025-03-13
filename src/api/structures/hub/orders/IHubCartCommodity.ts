import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubSale } from "../sales/IHubSale";
import { IHubSaleSnapshot } from "../sales/IHubSaleSnapshot";
import { IHubCartCommodityStock } from "./IHubCartCommodityStock";

/**
 * Items in cart
 *
 * An entity that visualizes a snapshot of an item that a customer has in
 * mind to purchase and has placed in their cart.
 *
 * {@link IHubCartCommodity} is an entity that visualizes a snapshot of an item
 * that a customer has in mind to purchase and has placed in their cart.
 *
 * And if the customer actually orders this in the future, the unit will change
 * from {@link IHubCartCommodity} to {@link IHubOrderGood}.
 *
 * And when placing an item snapshot in their cart, the customer will inevitably
 * select a specific unit or final stock within the item snapshot. Information
 * about this unit and stock is recorded in the sub-entity
 * {@link IHubCartCommodityStock}.
 *
 * @author Samchon
 */
export interface IHubCartCommodity {
  /**
   * Primary key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Product listing snapshot information.
   *
   * Contains listing information based on ordered products or shopping cart items,
   * so any units or stock not included in the order are removed.
   */
  sale: IHubSaleSnapshot.IInvert;

  /**
   * Fictional or not.
   *
   * A fictional cart item is a cart item that literally does not exist.
   *
   * It is mainly used when calculating the discount effect by
   * {@link IShoppingCoupon discount coupon} for individual {@link IHubSale items}.
   * It is also used to calculate the discount effect when a new item is added to
   * an already configured cart.
   *
   * It is never used in any other cases, and is never used at the order level.
   */
  pseudo: boolean;

  /**
   * The date and time the record was created.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubCartCommodity {
  /**
   * View list of products in your shopping cart or page information.
   */
  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      /**
       * The listing of the product.
       */
      sale?: IHubSale.IRequest.ISearch;
    }
    export type SortableColumns =
      | IHubSale.IRequest.SortableColumns
      | "commodity.created_at";
  }

  /**
   * Enter information to create products in your shopping cart.
   */
  export interface ICreate {
    /**
     * Property ID.
     */
    sale_id: string & tags.Format<"uuid">;

    /**
     * Final stock list.
     */
    stocks: IHubCartCommodityStock.ICreate[] & tags.MinItems<1>;
  }
}
