import { tags } from "typia";

import { IHubSaleUnitOption } from "./IHubSaleUnitOption";
import { IHubSaleUnitOptionCandidate } from "./IHubSaleUnitOptionCandidate";

/**
 * Selection information for the final stock.
 *
 * `IHubSaleUnitStockChoice` is an entity that visualizes which
 * {@link IHubSaleUnitStock stock} has selected for each
 * {@link IHubSaleUnitSelectableOption.variable variable select type option},
 * and which {@link IHubSaleUnitOptionCandidate candidate value} has been
 * selected within it.
 *
 * Of course, if the attributed unit does not have any options, this entity
 * can also be ignored.
 *
 * @author Samchon
 */
export interface IHubSaleUnitStockChoice {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * {@link IHubSaleUnitOption.id} of the attribution option.
   */
  option_id: string & tags.Format<"uuid">;

  /**
   * {@link IHubSaleUnitOptionCandidate.id} of the candidate value.
   */
  candidate_id: string & tags.Format<"uuid">;
}
export namespace IHubSaleUnitStockChoice {
  /**
   * Reverse reference information for final stock selection.
   */
  export interface IInvert {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Information about the attribution options.
     */
    option: IHubSaleUnitOption.IInvert;

    /**
     * Information about the candidate values selected by the customer.
     */
    candidate: IHubSaleUnitOptionCandidate | null;

    /**
     * Customer descriptive information.
     */
    value: null | boolean | number | string;
  }

  export interface ICreate {
    /**
     * Array index number of the attribute options.
     */
    option_index: number & tags.Type<"uint32">;

    /**
     * The array index number of the candidate value for attribution.
     */
    candidate_index: number & tags.Type<"uint32">;
  }
}
