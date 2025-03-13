import { tags } from "typia";

import { IPage } from "../../common/IPage";

/**
 * Section information.
 *
 * `IHubSection` is an entity designed to express section information in the
 * market.
 *
 * If we compare the section mentioned here to a mart, it means a spatially
 * separated area within the store, such as "fruit corner" or "meat corner".
 * Currently, the only section that exists in Luton's Generative Hub is
 * "API Market", but it is a concept designed in advance for future expansion.
 *
 * And unlike {@link IHubChannelCategory}, which can simultaneously classify one
 * {@link IHubSale listing}, a section can only classify one listing.
 *
 * > The basic code is `generative`
 *
 * @author Asher
 */
export interface IHubSection {
  /**
   * Primary key
   */
  id: string & tags.Format<"uuid">;

  /**
   * Separator code
   */
  code: string;

  /**
   * Section Name
   */
  name: string;

  /**
   * Record creation date and time
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubSection {
  /**
   * View section information and page information
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
       * Identifier Code
       */
      code?: string;

      /**
       * Section Name
       */
      name?: string;
    }
    export type SortableColumns =
      | "section.code"
      | "section.name"
      | "section.created_at";
  }

  /**
   * Section Creation Information
   */
  export interface ICreate {
    code: string;
    name: string;
  }

  /**
   * Section Edit Information
   */
  export interface IUpdate {
    name: string;
  }
}
