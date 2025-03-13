import { tags } from "typia";

/**
 * Option selection information for the final stock in the cart.
 *
 * When the customer puts a specific unit and a specific stock of
 * the product snapshot in the cart, it records which specific options) were used,
 * and which candidate items were selected or written within it.
 *
 * {@link IHubCartCommodityStockChoice} is a sub-entity of
 * {@link IHubCartCommodityStock}, and it records which specific options)
 * were used, and which candidate items were selected or written within it,
 * when the customer puts a specific unit and a specific stock of the
 * product snapshot in the cart.
 *
 * Therefore, {@link IHubCartCommodityStockChoice} has a reference property
 * and a description property for the candidate item in addition to the
 * reference to the option). If the target option type is select, the candidate
 * item selected by the customer is entered, and if not, the value entered
 * by the customer is entered.
 *
 * @author Samchon
 */
export namespace IHubCartCommodityStockChoice {
  /**
   * Enter information to select options for the final stocks in your shopping cart.
   */
  export interface ICreate {
    /**
     * Option ID.
     */
    option_id: string;

    /**
     * The selected candidate item ID.
     */
    candidate_id: null | (string & tags.Format<"uuid">);

    /**
     * The value provided by the customer for the descriptive option.
     */
    value: null | boolean | number | string;
  }
}
