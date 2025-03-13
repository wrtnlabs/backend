import { tags } from "typia";

import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";

import { IPage } from "../../common/IPage";

/**
 *  Hub channel information.
 *
 * `IHubChannel` is a concept that visualizes distribution channels
 * in the API brokerage market. In this system, a different channel means
 * a different site or application. Therefore, Wrtn Generative Hub
 * (https://hub.wrtn.com, tentative name) is also a channel.
 *
 * The basic code is `wrtn`. Of course, there is only one channel for
 * Generative Hub at present, but it is prepared in advance for future scalability.
 * Like {@link IHubExternalUser}, it is a concept designed in advance for possible
 * partnerships in the future. For reference, if Wrtn launches another site
 * (application) with a different brand name in addition to Generative Hub,
 * or if Wrtn uses (<iframe> ) If you are launching a simple hub site to distribute
 * to your partners, you will also need a new channel.
 *
 * @author Asher
 */
export interface IHubChannel {
  /**
   * Primary key
   */
  id: string & tags.Format<"uuid">;

  /**
   * Identifier code.
   */
  code: string;

  /**
   * Channel name.
   */
  name: string;

  /**
   * Record creation date and time
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubChannel {
  /**
   * Hierarchical information.
   */
  export interface IHierarchical extends IHubChannel {
    /**
     * List of subcategories.
     */
    categories: IHubChannelCategory.IHierarchical[];
  }

  /**
   * View Hierarchy Information and Page Information
   */
  export interface IRequest extends IPage.IRequest {
    /**
     * Search Conditions
     */
    search?: IRequest.ISearch;

    /**
     * Sorting Conditions
     */
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      /**
       * Channel Code
       */
      code?: string;

      /**
       * Channel name
       */
      name?: string;
    }
    export type SortableColumns =
      | "channel.code"
      | "channel.name"
      | "channel.created_at";
  }

  /**
   * Input information for creating hierarchical information.
   */
  export interface ICreate {
    /**
     * Separator code
     */
    code: string;

    /**
     * Channel name
     */
    name: string;
  }

  /**
   * Channel edit information.
   */
  export interface IUpdate {
    /**
     * Channel name
     */
    name: string;
  }
}
