import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { IHubSaleUnitHost } from "./IHubSaleUnitHost";
import { IHubSaleUnitOption } from "./IHubSaleUnitOption";
import { IHubSaleUnitStock } from "./IHubSaleUnitStock";

/**
 * Information on individual units of a listing.
 *
 * `IHubSaleUnit` is an entity that embodies the "individual product"
 * information handled by a listing. And the "individual product" mentioned here
 * is a concept corresponding to an individual server unit in the hub system,
 * that is, a Swagger document.
 *
 * As a side note, the reason why `IHubSaleUnit` is separated from
 * {@link IHubSaleSnapshot} in a 1: N logarithmic relationship is because there
 * are often cases where multiple products are sold from a single listing. This is
 * the case with the so-called "bundled products".
 *
 * - Bundled products in general products (laptop set)
 *   - Body
 *   - Keyboard
 *   - Mouse
 *   - Apple Care (free A/S rights)
 * - Bundled products in hub system (writer AI set)
 *   - Writing server
 *   - Image creation server
 *   - Logo/cover creation server
 *
 * And `IHubSaleUnit` does not mean the {@link IHubSaleUnitStock final stock}
 * that {@link IHubCustomer customer} will purchase in itself. The final stock
 * is something that can be met only after selecting all of the given
 * {@link IHubSaleUnitOption options} and its
 * {@link IHubSaleUnitOptionCandidate candidate values}.
 *
 * For example, even if you buy a laptop, the final stock is determined
 * only after selecting all of the options (CPU / RAM / SSD) in it.
 *
 * @author Samchon
 */
export interface IHubSaleUnit extends IHubSaleUnit.ISummary {
  /**
   * List of options.
   */
  options: IHubSaleUnitOption[];

  /**
   * Stock list.
   */
  stocks: IHubSaleUnitStock[] & tags.MinItems<1>;
}
export namespace IHubSaleUnit {
  /**
   * Reverse reference information of the sale unit.
   *
   * `IHubSaleUnit.IInvert` is a data structure interface that visualizes
   * the reverse reference information of the sale unit from the perspective of
   * {@link IHubCartCommodity}, and therefore, in terms of DB concept, it is a
   * structure corresponding to {@link IHubCartCommodityStock}.
   *
   * Therefore, `IHubSaleUnit.IInvert` does not have all {@link IHubSaleUnitStock}
   * records of the sale unit, but only has elements that are in the
   * {@link IHubCartCommodity shopping cart}.
   */
  export interface IInvert extends ISummary {
    /**
     * Stock purchased (to be purchased).
     */
    stock: IHubSaleUnitStock.IInvert;
  }

  /**
   * Summary information about the listing unit.
   */
  export interface ISummary {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * The representative name of the unit.
     */
    name: string;

    /**
     * Whether it is a main unit or not.
     *
     * It is a simple notational attribute, and has no meaning beyond labeling.
     */
    primary: boolean;

    /**
     * Whether this unit is mandatory.
     *
     * If this unit is mandatory, the customer cannot purchase it without
     * excluding it.
     */
    required: boolean;

    /**
     * List of connector icons.
     *
     * The connector icon represents the icons of external services that
     * this property is linked to.
     */
    connector_icons: Array<string & tags.Format<"uri">> & tags.UniqueItems;
  }

  /**
   * Input information for the listing unit.
   */
  export interface ICreate {
    /**
     * Host information.
     */
    host: IHubSaleUnitHost;

    /**
     * Swagger document data.
     */
    swagger:
      | SwaggerV2.IDocument
      | OpenApiV3.IDocument
      | OpenApiV3_1.IDocument
      | OpenApi.IDocument;

    /**
     * Description of the unit.
     */
    contents: IUnitContent[] & tags.MinItems<1>;

    /**
     * Whether it is a main unit or not.
     *
     * It is a simple notational attribute, and has no meaning beyond labeling.
     */
    primary: boolean;

    /**
     * Whether this unit is mandatory.
     *
     * If this unit is mandatory, the customer cannot purchase it
     * without excluding it.
     */
    required: boolean;

    /**
     * List of options.
     */
    options: IHubSaleUnitOption.ICreate[];

    /**
     * Stock list.
     */
    stocks: IHubSaleUnitStock.ICreate[] & tags.MinItems<1>;

    /**
     * {@link IHubSaleUnit.id} of the parent unit.
     *
     * Customers who purchased the above unit can also use this unit.
     *
     * If you modify the listing and leave this value as `null`,
     * it means that you will no longer provide new APIs to customers
     * who purchased the previous version of the unit.
     */
    parent_id: null | (string & tags.Format<"uuid">);
  }

  export interface IUnitContent {
    /**
     * Language code.
     */
    lang_code?: IHubCustomer.LanguageType;

    /**
     * name.
     */
    name: string;

    /**
     * Original language or not.
     */
    original: boolean;
  }
}
