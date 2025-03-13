import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

/**
 * Recommended listing information.
 *
 * `IHubSaleRecommend` is an entity that visualizes recommended listing
 * information. Recommended listings are based on the information of
 * {@link IHubSale sale listing}, but as recommended listings, they can have
 * special properties, so they are defined as a separate interface.
 *
 * Recommended listings are used to provide recommended listing information
 * tailored to user information.
 *
 * @author Asher
 */
export interface IHubSaleRecommend extends IHubSale.ISummary {}

export namespace IHubSaleRecommend {
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
    export interface ISearch {
      sale: IHubSale.IRequest.ISearch;
    }

    export type SortableColumns = IHubSale.IRequest.SortableColumns;
  }

  export interface ISummary extends IHubSale.ISummary {}
}
