import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { IPage } from "../../../common/IPage";

/**
 * Information on managing sales items in the form of bundled products in `hub`.
 *
 * {@link IHubSale} is an interface that bundles {@link IHubSaleUnit} of items,
 *
 * `IHubSaleCollection` is an interface that bundles {@link IHubSale sales},
 * which is the upper concept of {@link IHubSale}.
 * @author Asher
 */
export interface IHubSaleCollection extends IHubSaleCollection.IBase {}

export namespace IHubSaleCollection {
  export type Type = "html" | "md" | "txt";

  export interface ICreate {
    /**
     * List of representative product images.
     */
    thumbnail: string & tags.Format<"url">;

    /**
     * Background color.
     */
    background_color: IHubSaleCollection.CollectionColorType;

    /**
     *  multi-language contents.
     */
    contents: IContent[] & tags.MinItems<1>;

    sale_ids: Array<string & tags.Format<"uuid">>;
  }

  export interface IContent {
    /**
     *  title.
     */
    title: string;

    /**
     * Body format.
     */
    format: IHubSaleCollection.Type;

    /**
     * language code.
     */
    lang_code: IHubCustomer.LanguageType;

    /**
     * Description information in the text.
     */
    body: string | null;

    /**
     * Summary Information
     */
    summary: string;
  }

  export type CollectionColorType =
    | "pink"
    | "blue"
    | "green"
    | "orange"
    | "yellow"
    | "violet";

  export interface IUpdate extends ICreate {}

  export interface IBase extends IContent {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * List of representative product images.
     */
    thumbnail: string & tags.Format<"url">;

    /**
     * Background color.
     */
    background_color: IHubSaleCollection.CollectionColorType;

    /**
     * A list of items for sale in that collection.
     */
    sales: IHubSale.ISummary[] & tags.MinItems<1>;

    /**
     * Number of properties owned.
     */
    sale_count: number & tags.Minimum<1>;

    /**
     * The date and time the record was created.
     */
    created_at: string & tags.Format<"date-time">;
  }

  export interface ISummary extends Omit<IBase, "sales"> {}

  export interface IForAdmin
    extends Omit<IBase, "title" | "format" | "summary" | "body" | "lang_code"> {
    /**
     *  multi-language contents
     */
    contents: IContent[] & tags.MinItems<1>;
  }

  export interface IRequest extends IPage.IRequest {
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }

  export namespace IRequest {
    export type SortableColumns = "created_at";
  }
}
