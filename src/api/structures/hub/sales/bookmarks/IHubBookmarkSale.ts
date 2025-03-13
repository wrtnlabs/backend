import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

/**
 * Bookmark information for listings.
 *
 * `IHubSaleBookmark` is the information that is generated when you bookmark
 * {@link IHubSale listings}.
 *
 * @author Asher
 */
export interface IHubBookmarkSale {
  /**
   * Bookmark ID.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Bookmark target property information.
   */
  sale: IHubSale;

  /**
   * Date and time the bookmark was created.
   */
  created_at: string & tags.Format<"date-time">;
}

export namespace IHubBookmarkSale {
  /**
   * Summary information of the property bookmark.
   */
  export interface ISummary {
    /**
     * Bookmark ID.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Summary information about the bookmarked property.
     */
    sale: IHubSale.ISummary;

    /**
     * Date and time the bookmark was created.
     */
    created_at: string & tags.Format<"date-time">;
  }

  /**
   * Information on creating bookmarks.
   */
  export interface ICreate {
    /**
     * The ID of the property to be bookmarked.
     */
    sale_id: string & tags.Format<"uuid">;
  }

  /**
   * Search and page request information for property bookmarks.
   */
  export interface IRequest extends IPage.IRequest {
    /**
     * Search information.
     */
    search?: IRequest.ISearch;

    /**
     * Sort criteria.
     */
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }

  export namespace IRequest {
    /**
     * Bookmark search information.
     */
    export interface ISearch {
      keyword?: string;
    }
    export type SortableColumns = "created_at";
  }
}
