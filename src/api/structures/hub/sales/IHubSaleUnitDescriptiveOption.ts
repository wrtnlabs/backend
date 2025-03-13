import { tags } from "typia";

/**
 * Descriptive Option.
 *
 * {@link IHubSaleUnitOption option} registered in
 * {@link IHubSaleUnit listing unit} is descriptive,
 *
 * so whatever the customer writes about it has no effect on
 * {@link IHubSaleUnitStock final stock}.
 *
 * This information is only for reference by the seller.
 *
 * @author Samchon
 */
export interface IHubSaleUnitDescriptiveOption
  extends IHubSaleUnitDescriptiveOption.ICreate {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;
}
export namespace IHubSaleUnitDescriptiveOption {
  /**
   * Back reference information for descriptive options.
   */
  export interface IInvert extends ICreate {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;
  }

  /**
   * Input information for descriptive options.
   */
  export interface ICreate {
    /**
     * The type of the descriptive option.
     *
     * What format should it be entered in?
     */
    type: "boolean" | "number" | "string";

    /**
     * Representative name for descriptive options.
     */
    name: string;
  }
}
