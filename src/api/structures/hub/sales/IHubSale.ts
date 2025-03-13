import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubSeller } from "../actors/IHubSeller";
import { IHubSection } from "../systematic/IHubSection";
import { IHubSaleSnapshot } from "./IHubSaleSnapshot";
import { IHubSaleUnit } from "./IHubSaleUnit";
import { IHubSaleAudit } from "./audits/IHubSaleAudit";
import { IHubSaleReview } from "./inquiries/IHubSaleReview";

/**
 * Listing information.
 *
 * `IHubSale` is an entity that embodies the "API product sales (sales)"
 * information registered by {@link IHubSeller seller}.
 *
 * And the main information of the listing is recorded in the subordinate
 * {@link IHubSaleSnapshot}, not this entity. Therefore, when a seller edits a
 * listing that has already been registered, the existing `IHubSale` record
 * is not changed, but a new {@link IHubSaleSnapshot} record is created. This is
 * to preserve the customer's purchase history at the time, even if the seller
 * changes the {@link IHubSaleUnitStock components} or
 * {@link IHubSaleUnitStockPrice price} of a specific listing after
 * {@link IHubOrderGood customer} purchased it. In addition, it is to support
 * the seller to perform so-called A/B tests, which measure the performance of
 * each case by changing the components or prices, etc.
 *
 * And considering the case of bundled products or options, the product information
 * is connected to the entities below. Since the structure of these is quite
 * complicated, please read the descriptions written in this `IHubSale` and the
 * entities below carefully.
 *
 * - {@link IHubSaleSnapshot}
 * - {@link IHubSaleUnit}
 * - {@link IHubSaleUnitOption}
 * - {@link IHubSaleUnitOptionCandidate}
 * - {@link IHubSaleUnitStock}
 *
 * In addition, regarding the Swagger (OpenAPI) Documents, which are the sales
 * target of this `IHubSale`, please read the documents below carefully to make
 * sure you understand the composition principles.
 *
 * - {@link IHubSaleUnitSwagger}
 * - {@link IHubSaleUnitHost}
 * - {@link IHubSaleUnitRoute}
 * - {@link OpenApi.IDocument}
 * - {@link OpenApi.IOperation}
 * - {@link OpenApi.IComponents}
 * - {@link OpenApi.IJsonSchema}
 * - {@link OpenApi.ISecurityScheme}
 *
 * @author Samchon
 */
export interface IHubSale extends IHubSaleSnapshot, IHubSale.ITimestamps {
  /**
   * Section of Attribution.
   *
   * In which section is this listing sold?
   */
  section: IHubSection;

  /**
   * The seller who listed the item.
   */
  seller: IHubSeller.IInvert;

  /**
   * Audit information.
   *
   * If this value is `null` or the internal attribute value
   * {@link IHubSaleAudit.approved_at} is `null`, the customer cannot view or
   * browse/purchase it at all. Only the seller and the administrator are aware
   * of the existence of the listing.
   */
  audit: null | IHubSaleAudit.IInvert;

  /**
   * The point in time when you added it to your bookmarks.
   */
  bookmarked_at: null | (string & tags.Format<"date-time">);
}

export namespace IHubSale {
  /**
   * Information on the time of listing.
   */
  export interface ITimestamps {
    /**
     * The date and time the record was created.
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * Temporary suspension of sales.
     *
     * The seller has temporarily suspended API sales for some reason.
     *
     * Customers can still view the listing on the listing and details page,
     * but the listing will be labeled as "This listing is suspended by the
     * seller."
     */
    paused_at: null | (string & tags.Format<"date-time">);

    /**
     * Temporary suspension of sales.
     *
     * The seller has suspended sales for some reason.
     *
     * Customers will not be able to view the listing or details page at all.
     * At first glance, it looks similar to a soft delete, but the difference is
     * that the seller and the administrator can still view it, and the sale can
     * be resumed at any time.
     *
     * Also, even if the seller has suspended, previous buyers of the listing
     * can still use the API. The time of suspension of the API can be found in
     * the {@link IHubSaleSnapshot.expired_at} property.
     */
    suspended_at: null | (string & tags.Format<"date-time">);

    /**
     * Sales start date.
     */
    opened_at: null | (string & tags.Format<"date-time">);

    /**
     * The sale end date.
     *
     * If this value is NULL, the sale will continue forever.
     */
    closed_at: null | (string & tags.Format<"date-time">);
  }

  /**
   * Information about property searches and page requests.
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
     * Search information.
     */
    export interface ISearch {
      id?: string & tags.Format<"uuid">;
      category_ids?: Array<string & tags.Format<"uuid">>;
      show_paused?: boolean | "only";
      show_suspended?: boolean | "only";
      section_codes?: string[];
      title?: string;
      content?: string;
      title_or_content?: string;
      title_or_content_tag?: string;
      tags?: string[];
      seller?: IHubSeller.IRequest.ISearch;
      review?: IHubSaleReview.IInvertSearch;
      audit?: {
        state?: AuditState;
      };
      show_bookmarked?: boolean | "only";
    }

    export type AuditState = "approved" | "rejected" | "none" | "agenda";
    export type SortableColumns =
      | IHubSeller.IRequest.SortableColumns
      | "goods.publish_count"
      | "goods.payments"
      | "reviews.average"
      | "reviews.count"
      | "sale.created_at"
      | "sale.opened_at"
      | "sale.closed_at"
      | "sale.view_count";
  }

  /**
   * Summary information about the property.
   */
  export interface ISummary extends IHubSaleSnapshot.ISummary, ITimestamps {
    /**
     * The seller who wrote this listing.
     */
    seller: IHubSeller.IInvert;

    /**
     * The belonging section.
     */
    section: IHubSection;

    /**
     * Audit information.
     *
     * If this value is `null` or the internal attribute value
     * {@link IHubSaleAudit.approved_at} is `null`, the customer cannot view or
     * browse/purchase it at all. Only the seller and the administrator are aware
     * of the existence of the listing.
     */
    audit: null | IHubSaleAudit.IInvert;

    /**
     * The point in time when you added it to your bookmarks.
     */
    bookmarked_at: null | (string & tags.Format<"date-time">);
  }

  /**
   * Enter the listing information.
   */
  export interface ICreate extends IHubSaleSnapshot.ICreate {
    /**
     * {@link IHubSection.code} in the belonging section.
     */
    section_code: string;

    /**
     * The time when the sale of this property automatically begins.
     */
    opened_at: null | (string & tags.Format<"date-time">);

    /**
     * The time at which the sale of this property automatically ends.
     */
    closed_at: null | (string & tags.Format<"date-time">);

    /**
     * Whether to auto-approval.
     *
     * Temporary variable, to be removed in the future.
     */
    __approve?: boolean;

    /**
     *  @internal
     */
    id?: string & tags.Format<"uuid">;
  }

  /**
   * Edit listing information.
   */
  export type IUpdate = ICreate;
}
