import { tags } from "typia";

import { IHubSaleAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleAggregate";

import { IHubSeller } from "../actors/IHubSeller";
import { IHubChannelCategory } from "../systematic/IHubChannelCategory";
import { IHubSection } from "../systematic/IHubSection";
import { IHubSale } from "./IHubSale";
import { IHubSaleContent } from "./IHubSaleContent";
import { IHubSaleUnit } from "./IHubSaleUnit";

/**
 * Snapshot information of the listing.
 *
 * `IHubSaleSnapshot` is an entity that embodies the snapshot of the listing,
 * and its role is defined in the DB as follows.
 *
 * > {@link hub_sales IHubSale} is an entity that embodies the "product sale"
 * > (sales) information registered by the seller. And the main information of
 * > the listing is recorded in the subordinate `hub_sale_snapshots`, not the
 * > main `hub_sales`. When the seller changes the listing that has already
 * > been registered, the existing hub_sales record is not changed, but a new
 * > snapshot record is created.
 * >
 * > This is to preserve the customer's purchase history at the time, even if the
 * > {@link IHubSeller seller} changes the {@link IHubSaleUnitStock components}
 * > or {@link IHubSaleUnitStockPrice price} of the listing after the customer
 * > purchases the listing. It is also to support the seller to change the components
 * > or prices, etc. and measure the performance for each case, so-called A/B testing.
 *
 * However, at the DTO level used by front-end developers,
 * {@link IHubSale listing} and snapshots are not strictly distinguished this much,
 * and listings and snapshots are usually combined and processed as
 * {@link IHubSale} units.
 *
 * However, just because the DTO does not strictly distinguish between them
 * does not mean that the snapshot concept is not important, so please be sure
 * to fully understand the concept of "snapshot."
 *
 * @author Samchon
 */
export interface IHubSaleSnapshot
  extends IHubSaleSnapshot.IBase<IHubSaleContent, IHubSaleUnit> {
  /**
   * System prompt.
   *
   * A message that the system wants to convey to the user.
   */
  system_prompt: string | null;

  /**
   * User prompt examples.
   *
   * Examples of messages that the user wants to convey to the system.
   */
  user_prompt_examples: IHubSaleSnapshot.IUserPromptExample[];
}

export namespace IHubSaleSnapshot {
  /**
   * Reverse reference information of the listing snapshot.
   *
   * `IHubSaleSnapshot.IInvert` is a data structure interface that
   * visualizes the reverse reference information of the listing snapshot
   * from the perspective of {@link IHubCartCommodity}, and therefore, in terms
   * of DB concept, it corresponds to {@link IHubCartCommodityStock}.
   *
   * Therefore, `IHubSaleSnapshot.IInvert` does not have all {@link IHubSaleUnit},
   * {@link IHubSaleUnitStock}, and {@link IHubSaleUnitStockPrice} records of
   * the listing snapshot, but only has elements that are in the
   * {@link IHubCartCommodity shopping cart}.
   */
  export interface IInvert
    extends IBase<IHubSaleContent.IInvert, IHubSaleUnit.IInvert>,
      IHubSale.ITimestamps {
    /**
     * Information about the belonging section.
     */
    section: IHubSection;

    /**
     * The seller who listed the item.
     */
    seller: IHubSeller.IInvert;

    /**
     * System prompt.
     *
     * A message that the system wants to convey to the user.
     */
    system_prompt: string | null;

    /**
     * User prompt examples.
     *
     * Examples of messages that the user wants to convey to the system.
     */
    user_prompt_examples: IUserPromptExample[];
  }

  /**
   * Summary information of the listing snapshot.
   */
  export interface ISummary
    extends IBase<IHubSaleContent.ISummary, IHubSaleUnit.ISummary> {}

  /**
   * Common information for listing snapshots
   *
   * @template Content Content description information type
   * @template Unit Unit type
   */
  export interface IBase<Content, Unit> {
    /**
     * The ID of the property.
     */
    id: string & tags.Format<"uuid">;

    /**
     * The ID of the snapshot.
     */
    snapshot_id: string & tags.Format<"uuid">;

    /**
     * Last snapshot.
     *
     * Is this snapshot the last snapshot of the property?
     *
     * However, the criteria for "last" vary depending on the perspective of
     * the user viewing this property.
     *
     * - Customer perspective: The most recently approved property
     * - Seller/Administrator: The most recently created property
     */
    latest: boolean;

    /**
     * List of categories.
     *
     * Which categories the sale is registered to.
     */
    categories: IHubChannelCategory.IInvert[];

    /**
     * Aggregate/performance information for this listing (or snapshot).
     */
    aggregate: IHubSaleAggregate;

    /**
     * Content information.
     *
     * Descriptive information including the language code.
     *
     * If you want to see other language written contents, call the below API function.
     *
     * - {@link osApi.functional.hub.customers.sales.contents}
     * - {@link osApi.functional.hub.customers.sales.snapshots.contents}
     */
    content: Content;

    /**
     * Unit List.
     *
     * A record representing the products currently being sold, containing
     * information about the {@link IHubSaleUnitOption options} that can be
     * set for each product, and the {@link IHubSaleUnitStock stock} that
     * can be configured by selecting options.
     */
    units: Unit[] & tags.MinItems<1>;

    /**
     * Version name.
     *
     * You can set a different value than {@link ISwaggerInfo.version}.
     *
     * That is, the version name in the server spec (Swagger document) and
     * the version name in the product may be different.
     */
    version: string;

    /**
     * Activation time of the snapshot.
     *
     * The time this snapshot was first activated after it was approved for review.
     */
    activated_at: null | (string & tags.Format<"date-time">);

    /**
     * The time when the APIs of the current listing (snapshot) are stopped.
     *
     * Since the transaction target is an API, the seller should not
     * immediately delete the listing just because it has stopped selling.
     * It should guarantee a minimum period of use, so that customers using
     * the API will respond to this.
     *
     * Therefore, when the listing is stopped, it is made to disappear after
     * a certain grace period.
     *
     * Of course, if it is a listing that has never been sold, it does not apply.
     */
    expired_at: null | (string & tags.Format<"date-time">);
  }

  /**
   * Input information for the listing snapshot.
   */
  export interface ICreate {
    /**
     * List of target categories' {@link IHubChannelCategory.id}s.
     *
     * If empty, it meansall categories is listing the sale.
     */
    category_ids: Array<string & tags.Format<"uuid">>;

    /**
     * System prompt.
     *
     * A message that the system wants to convey to the user.
     */
    system_prompt: string | null;

    /**
     * User prompt examples.
     *
     * Examples of messages that the user wants to convey to the system.
     */
    user_prompt_examples: IUserPromptExample[];

    /**
     * Content information.
     *
     * Descriptive information written by the seller when listing the item.
     *
     * If you want to support multiple languages, just assign the multiple
     * language values to the `title`, `description`, and `summary`
     * properties.
     *
     * Note that, icons and attachment files must be composed separately.
     * Its because the some icons or files may contain the prohibited
     * signs or symbols in the national or cultural level. If not and every icons
     * and files in each language content are the same, just copy and paste
     * their URL addresses.
     */
    contents: IHubSaleContent.ICreate[] & tags.MinItems<1>;

    /**
     * Unit list.
     */
    units: IHubSaleUnit.ICreate[] & tags.MinItems<1>;

    /**
     * Version name.
     *
     * You can set a different value than {@link ISwaggerInfo.version}.
     *
     * That is, the version name in the server spec (Swagger document)
     * and the version name in the snapshot can be different.
     */
    version: string;
  }

  /**
   * Update information for the listing snapshot.
   */
  export interface IUserPromptExample {
    /**
     * User prompt examples.
     *
     * Examples of messages that the user wants to convey to the system.
     */
    value: string;

    /**
     * The URL of the icon image.
     */
    icon_url: (string & tags.Format<"uri">) | null;
  }
}
