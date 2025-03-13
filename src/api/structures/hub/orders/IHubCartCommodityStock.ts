import { tags } from "typia";

import { IHubCartCommodityStockChoice } from "./IHubCartCommodityStockChoice";

/**
 * Final stock information of the item in the cart.
 *
 * {@link IHubCartCommodityStock} is a sub-entity of {@link IHubCartCommodity}
 * that embodies the information of the item snapshot in the cart, and corresponds
 * to the individual units in the target item snapshot and the stocks
 * selected among those units.
 *
 * Therefore, if a customer selects multiple units and stocks from the target
 * item snapshot, the {@link IHubCartCommodity} record will also have multiple
 * corresponding {@link IHubCartCommodityStock} records.
 *
 * @author Asher
 */
export namespace IHubCartCommodityStock {
  /**
   * Enter the final composition information for the items in your shopping cart.
   */
  export interface ICreate {
    /**
     * The listing unit ID.
     */
    unit_id: string & tags.Format<"uuid">;

    /**
     * The ID of the target stock.
     *
     * Please note that the backend server verifies that the target stock matches the
     * selection information of {@link choices}. Therefore, if you enter an incorrect value,
     * the shopping cart product registration will not work properly, so please be careful
     * about this.
     */
    stock_id: string & tags.Format<"uuid">;

    /**
     * The ID of the target stock price.
     */
    price_id: string & tags.Format<"uuid">;

    /**
     * Final product selection.
     *
     * See {@link IHubCartCommodityStockChoice.ICreate}.
     */
    choices: IHubCartCommodityStockChoice.ICreate[];
  }
}
