import { tags } from "typia";

import { IHubChannel } from "../systematic/IHubChannel";
import { IHubChannelCategory } from "../systematic/IHubChannelCategory";

/**
 * Sales channel/category information for the item.
 *
 * `IHubSaleChannel` is an entity that visualizes the channel/category
 * information through which the item is sold.
 *
 * @author Samchon
 */
export interface IHubSaleChannel extends IHubChannel {
  /**
   * List of sale categories.
   *
   * If the length of this attribute value is 0, the item is "unclassified"
   * for the category, and can be sold in all categories of the channel
   * it belongs to.
   */
  categories: IHubChannelCategory[];
}
export namespace IHubSaleChannel {
  /**
   * Enter information about the channel/category in which you will sell the item.
   */
  export interface ICreate {
    /**
     * {@link IHubChannel.code} of the target channel.
     */
    code: string;

    /**
     * {@link IHubChannelCategory.id} list of target categories.
     *
     * If this attribute value is set to an empty array, the item will be
     * in the "Unclassified" state for the category, and will be available
     * for sale in all categories of the channel it is affiliated with.
     */
    category_ids: Array<string & tags.Format<"uuid">> & tags.UniqueItems;
  }
}
