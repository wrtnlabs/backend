import { tags } from "typia";

import { IHubSaleUnitStockChoice } from "./IHubSaleUnitStockChoice";
import { IHubSaleUnitStockPrice } from "./IHubSaleUnitStockPrice";

/**
 * The final stock information in the listing unit.
 *
 * `IHubSaleUnitStock` is a sub-entity of {@link IHubSaleUnit} that represents
 * the individual product catalog within the listing, and is a kind of final
 * stock that is composed by selecting all of the
 * {@link IHubSaleUnitSelectableOption.variable options (variable "select" type)}
 * and their {@link IHubSAleUnitOptionCandidate candidate values} within the
 * belonging unit.
 *
 * It is the "goods" themselves that the customer actually purchases.
 *
 * - Unit name) MacBook body
 * - Options
 *   - CPU: { i3, i5, i7, i9 }
 *   - RAM: { 8GB, 16GB, 32GB, 64GB, 96GB }
 *   - SSD: { 256GB, 512GB, 1TB }
 * - Final number of stocks: 4 * 5 * 3 = 60
 *
 * For reference, the total number of `IHubSaleUnitStock` records in the belonging
 * unit can be obtained by Cartesian Sale. That is, the product of all the candidate
 * values that each (variable "select" type) option can have is the total number of
 * final stocks in the unit. Of course, if there is not a single variable "select"
 * type option, the final number of stocks in the unit is only 1.
 *
 * @author Samchon
 */
export interface IHubSaleUnitStock {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Representative name of the stock.
   */
  name: string;

  /**
   * Selection information for this stock.
   *
   * What options and candidate values are selected to make up the composition.
   */
  choices: IHubSaleUnitStockChoice[];

  /**
   * List of price information for this stock.
   *
   * A step-wise fixed/variable cost pricing model is used.
   */
  prices: IHubSaleUnitStockPrice[] & tags.MinItems<1>;
}
export namespace IHubSaleUnitStock {
  /**
   * Stock order reference information.
   */
  export interface IInvert {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Representative name of the stock.
     */
    name: string;

    /**
     * Selection information for this stock.
     *
     * What options and candidate values were selected by each customer.
     */
    choices: IHubSaleUnitStockChoice.IInvert[];

    /**
     * Pricing information for this stock.
     */
    price: IHubSaleUnitStockPrice.IInvert;
  }

  /**
   * Input information for stock.
   */
  export interface ICreate {
    /**
     * Representative name of the stock.
     */
    name: string;

    /**
     * Selection information for this stock.
     *
     * What options and candidate values are selected to make up the composition.
     */
    choices: IHubSaleUnitStockChoice.ICreate[];

    /**
     * List of price information for this stock.
     *
     * A step-wise fixed/variable cost pricing model is used.
     */
    prices: IHubSaleUnitStockPrice.ICreate[];
  }
}
