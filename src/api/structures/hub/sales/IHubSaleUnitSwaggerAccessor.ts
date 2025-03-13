import { tags } from "typia";

/**
 * Access information for a specific unit's swagger from the listing.
 *
 * @author Samchon
 */
export interface IHubSaleUnitSwaggerAccessor {
  /**
   * {@link IHubSaleUnit.id} of the target unit.
   */
  unit_id: string & tags.Format<"uuid">;
}
