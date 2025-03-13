import { tags } from "typia";

import { IHubSale } from "../sales/IHubSale";
import { IHubCouponCriteriaBase } from "./IHubCouponCriteriaBase";

/**
 * Conditions for the sale of the discount coupon.
 *
 * `IHubCouponCriteriaOfSale` is a subtype entity of
 * {@link IHubCouponCriteriaBase}, and is used to set conditions for
 * a specific {@link IHubSale}.
 *
 * If the {@link direction} value is "include", the coupon can only be
 * used for the sale, and if it is "exclude", the coupon cannot be used.
 *
 * @author Samchon
 */
export interface IHubCouponCriteriaOfSale
  extends IHubCouponCriteriaBase<"sale"> {
  /**
   * List of properties.
   *
   * A list of properties to include or exclude.
   */
  sales: IHubSale.ISummary[] & tags.MinItems<1>;
}
export namespace IHubCouponCriteriaOfSale {
  export interface ICreate extends IHubCouponCriteriaBase.ICreate<"sale"> {
    /**
     * {@link IHubSale.id} list of target listings.
     */
    sale_ids: Array<string & tags.Format<"uuid">> & tags.MinItems<1>;
  }
}
