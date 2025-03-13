import { tags } from "typia";

/**
 * Selectable candidate values in the option.
 *
 * `IHubSaleUnitOptionCandidate` is an entity that represents individual
 * candidate values that can be selected from
 * {@link IHubSaleUnitSelectableOption "select" type options}.
 *
 * - Case
 *   - Option) RAM: 8GB, 16GB, 32GB
 *   - Option) GPU: RTX 3060, RTX 4080, TESLA
 *   - Option) License type: Personal, Commercial, Education
 *
 * However, if the type of the attributable option is not "select"
 * ({@link IHubSaleUnitDescriptiveOption}),
 *
 * this entity is not needed.
 *
 * @author Samchon
 */
export interface IHubSaleUnitOptionCandidate {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Representative name of the candidate value.
   */
  name: string;
}
export namespace IHubSaleUnitOptionCandidate {
  /**
   * Candidate value input information.
   */
  export interface ICreate {
    /**
     * Representative name of the candidate value.
     */
    name: string;
  }
}
