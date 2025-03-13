import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

/**
 * Channel category information.
 *
 * `IHubChannelCategory` is a concept that means a classification category
 * within a specific channel, and it is exactly the same as the concept that
 * is usually referred to as "category" in the exchange.
 *
 * And `IHubChannelCategory` means a "corner", which is an independent
 * spatial information in the offline market, and unlike {@link IHubSection},
 * where simultaneous classification of {@link IHubSale listings} is impossible,
 * one listing can be classified into multiple categories at the same time.
 *
 * For example, beef and grapes can belong to the fruit corner and the meat corner,
 * respectively, but they do not belong to any of the categories, and can form
 * independent M:N relationships with various categories according to the
 * characteristics of each product.
 *
 * Product | Corner       | Classification
 * --------|--------------|-----------------------------------
 * Beef    | Meat Corner  | Frozen Food, Meat, Specialty Food
 * Grape   | Fruit Corner | Fresh food, convenience food
 *
 * In addition, the categories have a 1: N recursive structure, so a
 * hierarchical expression is possible as shown below. Also, you can set
 * different categories for each {@link IHubChannel channel}, so you can
 * freely set the category classification you want for each channel.
 *
 * - Grocery > Meat > Frozen
 * - Electronics > Laptop > 15-inch
 * - Miscellaneous goods > Wallets
 *
 * Also, since the API supports (or plans to support) a merge function
 * between multiple categories, there will be no particular burden in
 * constantly editing the categories.
 *
 * @author Asher
 */
export interface IHubChannelCategory extends IHubChannelCategory.IBase {
  /**
   * Disinformation on the parent category.
   */
  parent: null | IHubChannelCategory.IInvert;

  /**
   * List of child categories.
   */
  children: IHubChannelCategory.IHierarchical[];
}
export namespace IHubChannelCategory {
  /**
   * Hierarchical information.
   */
  export interface IHierarchical extends IBase {
    /**
     * List of child categories.
     */
    children: IHubChannelCategory.IHierarchical[];
  }

  export interface IForAdmin extends Omit<IHubChannelCategory, "name"> {
    name: LangName[];
  }

  /**
   * Channel category reverse information.
   */
  export interface IInvert extends IBase {
    /**
     * Parent category.
     */
    parent: null | IHubChannelCategory.IInvert;
  }

  /**
   * Basic information.
   */
  export interface IBase {
    /**
     * Primary key
     */
    id: string & tags.Format<"uuid">;

    /**
     * {@link IHubChannelCategory.id} of the parent category.
     */
    parent_id: null | (string & tags.Format<"uuid">);

    /**
     * Channel category name.
     */
    name: string;

    /**
     * Category background color.
     */
    background_color: BackgroundColor | null;

    /**
     * Category background image.
     */
    background_image_url: string | null;

    /**
     * The date and time the record was created.
     */
    created_at: string & tags.Format<"date-time">;
  }

  /**
   * Category background color type.
   */
  export type BackgroundColor =
    | "blue"
    | "green"
    | "yellow"
    | "inspired_red"
    | "apricot"
    | "violet"
    | "pink"
    | "black";

  /**
   * Information on creating channel category information.
   */
  export interface ICreate {
    /**
     * {@link IHubChannelCategory.id} of the parent category.
     */
    parent_id: null | (string & tags.Format<"uuid">);

    /**
     * Channel category name.
     */
    lang_names: LangName[] & tags.MinItems<1>;

    /**
     * Category background color.
     */
    background_color: BackgroundColor | null;

    /**
     * Category background image.
     */
    background_image_url: string | null;
  }

  /**
   * Information on editing channel categories.
   */
  export type IUpdate = Partial<ICreate>;

  export type LangName = {
    name: string;
    lang_code: IHubCustomer.LanguageType;
  };
}
