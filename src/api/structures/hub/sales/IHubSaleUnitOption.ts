import { IHubSaleUnitDescriptiveOption } from "./IHubSaleUnitDescriptiveOption";
import { IHubSaleUnitSelectableOption } from "./IHubSaleUnitSelectableOption";

/**
 * Individual option information in the listing unit.
 *
 * `IHubSaleUnitOption` is a sub-entity of {@link IHubSaleUnit} that
 * visualizes individual products in the listing, and is an entity
 * designed to visualize individual option information of the unit.
 *
 * And as a union type entity of {@link IHubSaleUnitSelectableOption} and
 * {@link IHubSaleUnitDescriptiveOption} that mean selectable and descriptive
 * options respectively, specification for each type can be simply done with
 * an `if condition` for the `type` property as follows.
 *
 * ```typescript
 * if (option.type === "select")
 * option.candidates; // IHubSaleUnitSelectableOption
 * ```
 *
 * - Option Case
 *   - Selectable Option
 *   - Computer Performance: CPU, GPU, RAM, etc.
 *   - Image Generation AI: Rendering Quality, License Type, Theme, etc.
 * - Descriptive Option
 *   - Labeling
 *   - Purpose of Use (Survey)
 *
 * If the type of the option is select and
 * {@link IHubSaleUnitSelectableOption.variable variable} is true, then the
 * {@link IHubSaleUnitStock final stock} that the customer will purchase
 * will change depending on the selection of the candidate value.
 *
 * On the other hand, if the type is other than select or the type is select
 * but {@link IHubSaleUnitSelectableOption.variable variable} is false, then this
 * is an option that has no meaning beyond simple information transmission.
 * Therefore, no matter what value the customer enters and selects when
 * purchasing it, the option in this case does not affect the
 * {@link IHubSaleUnitStock final stock}.
 *
 * @author Samchon
 */
export type IHubSaleUnitOption =
  | IHubSaleUnitSelectableOption
  | IHubSaleUnitDescriptiveOption;
export namespace IHubSaleUnitOption {
  /**
   * Type of option.
   */
  export type Type = "select" | "boolean" | "number" | "string";

  /**
   * Reverse reference information for options.
   */
  export type IInvert =
    | IHubSaleUnitSelectableOption.IInvert
    | IHubSaleUnitDescriptiveOption.IInvert;

  /**
   * Input information for the option.
   */
  export type ICreate =
    | IHubSaleUnitSelectableOption.ICreate
    | IHubSaleUnitDescriptiveOption.ICreate;
}
