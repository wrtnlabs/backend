import { tags } from "typia";

import { IHubSaleUnitOptionCandidate } from "./IHubSaleUnitOptionCandidate";

/**
 * Information on individual selectable options in the listing unit.
 *
 * `IHubSaleUnitSelectableOption` is a sub-entity of {@link IHubSaleUnit}
 * that visualizes individual products in the listing, and is an entity
 * designed to visualize individual **selectable** option information of the unit.
 *
 * - Examples of selectable options
 * - Computer performance: CPU, GPU, RAM, etc.
 * - Image generation AI: Rendering quality, license type, theme, etc.
 *
 * And if the attribute value {@link IHubSaleUnitSelectableOption.variable}
 * of this entity is `true`, this means that the {@link IHubSaleUnitStock final stock}
 * to be purchased will vary depending on which
 * {@link IHubSaleUnitOptionCandidate candidate value} the customer selects
 * in this option.
 *
 * Conversely, if the above value is `false`, then whatever
 * {@link IHubSaleUnitOptionCandidate candidate value} the customer selects
 * from the options seen will not affect the {@link IHubSaleUnitStock final stock}
 * that the customer will purchase. It is just simple information that the seller
 * will use for reference only.
 *
 * @author Samchon
 */
export interface IHubSaleUnitSelectableOption
  extends IHubSaleUnitSelectableOption.IInvert {
  /**
   * List of candidate values.
   *
   * A list of values that the customer can select for this option.
   */
  candidates: IHubSaleUnitOptionCandidate[];
}
export namespace IHubSaleUnitSelectableOption {
  export interface IInvert extends Omit<ICreate, "candidates"> {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;
  }
  export interface ICreate {
    /**
     * Type of option.
     */
    type: "select";

    /**
     * Representative name of the option.
     */
    name: string;

    /**
     * Variable.
     *
     * If this attribute value is `true`, this option will change the
     * {@link IHubSaleUnitStock final stock} that the customer purchases,
     * depending on what the customer selects as the
     * {@link IHubSaleUnitOptionCandidate candidate value}.
     *
     * On the other hand, if this value is `false`, whatever the customer selects
     * as the {@link IHubSaleUnitOptionCandidate candidate value}, it will not
     * affect the {@link IHubSaleUnitStock final stock}. It is just simple
     * information for the seller to refer to.
     */
    variable: boolean;

    /**
     * List of candidate values.
     *
     * A list of values that the customer can select for this option.
     */
    candidates: IHubSaleUnitOptionCandidate.ICreate[];
  }
}
