import { tags } from "typia";

import { IHubSeller } from "../actors/IHubSeller";
import { IHubCouponCriteriaBase } from "./IHubCouponCriteriaBase";

/**
 * Conditions for the seller of the discount coupon.
 *
 * `IHubCouponCriteriaOfSeller` is a subtype entity of
 * {@link IHubCouponCriteriaBase}, and is used to set conditions
 * for a specific {@link IHubSeller}.
 *
 * If the {@link direction} value is "include", the coupon can only be
 * used for the seller, and if it is "exclude", the coupon cannot be used.
 *
 * @author Samchon
 */
export interface IHubCouponCriteriaOfSeller
  extends IHubCouponCriteriaBase<"seller"> {
  /**
   * List of sellers.
   *
   * A list of sellers to include or exclude.
   */
  sellers: IHubSeller[] & tags.MinItems<1>;
}
export namespace IHubCouponCriteriaOfSeller {
  export interface ICreate extends IHubCouponCriteriaBase.ICreate<"seller"> {
    /**
     * {@link IHubSeller.id} list of target sellers.
     */
    seller_ids: Array<string & tags.Format<"uuid">> & tags.MinItems<1>;
  }
}
