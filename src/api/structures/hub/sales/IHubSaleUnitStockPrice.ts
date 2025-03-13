import { tags } from "typia";

import { IHubOrderPrice } from "../orders/IHubOrderPrice";

/**
 * Stock price information.
 *
 * `IHubSaleUnitStockPrice` is an entity that visualizes the step
 * price information of stock. And the step price mentioned here means that
 * each includes both fixed and variable costs, and there are multiple
 * such sections.
 *
 * You can easily understand what step price information is by looking
 * at the example below.
 *
 * - Fixed cost 50,000 won, free up to 1,000 APIs, 100 won per excess
 * - Fixed cost 100,000 won, free up to 2,500 APIs, 75 won per excess
 * - Fixed cost 150,000 won, free up to 4,000 APIs, 50 won per excess
 *
 * @author Samchon
 */
export interface IHubSaleUnitStockPrice extends IHubSaleUnitStockPrice.ICreate {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;
}
export namespace IHubSaleUnitStockPrice {
  /**
   * Order reference information for stock price.
   */
  export interface IInvert {
    id: string & tags.Format<"uuid">;

    /**
     * Threshold, fixed amount {@link fixed} number of free API calls you can make.
     */
    threshold: number & tags.Type<"uint32">;

    /**
     * Fixed costs.
     */
    fixed: IHubOrderPrice.ISummary;

    /**
     * Variable costs.
     */
    variable: IHubOrderPrice.ISummary;
  }

  /**
   * Reverse reference information for stock price information.
   */
  export interface ICreate {
    /**
     * Threshold, fixed amount {@link fixed} number of free API calls you can make.
     */
    threshold: number & tags.Type<"uint32">;

    /**
     * Fixed costs.
     */
    fixed: number & tags.Minimum<0>;

    /**
     * Variable Fee.
     *
     * A fee charged per API call that exceeds {@link threshold}.
     */
    variable: number & tags.Minimum<0>;
  }
}
