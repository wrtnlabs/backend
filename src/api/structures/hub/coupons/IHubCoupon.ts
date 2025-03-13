import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubAdministrator } from "../actors/IHubAdministrator";
import { IHubSeller } from "../actors/IHubSeller";
import { IHubCouponCriteria } from "./IHubCouponCriteria";
import { IHubCouponDiscount } from "./IHubCouponDiscount";
import { IHubCouponInventory } from "./IHubCouponInventory";
import { IHubCouponRestriction } from "./IHubCouponRestriction";

/**
 * Discount coupon.
 *
 * `IHubCoupon` is an entity that embodies a discount coupon on the exchange.
 *
 * However, `IHubCoupon` only contains the specification information
 * for the discount coupon.
 *
 * Please note that this is a different concept from {@link IHubCouponTickeet},
 * which means issuing a discount coupon, or {@link IHubCouponTicketPayment},
 * which means paying it.
 *
 * In addition, discount coupons are applied to {@link IHubOrder order} units,
 * but each has its own unique {@link IHubCouponCriteria constraints}. For example,
 * a coupon with {@link IHubCouponCriteriaOfSeller seller constraints} can only be
 * used for {@link IHubSale listings} registered by the corresponding
 * {@link IHubSeller seller}, or cannot be used. There are also restrictions such as
 * a minimum amount limit for using a discount coupon, and a maximum discount amount.
 *
 * In addition, you can set whether the discount coupon is issued publicly or only
 * to those who know a specific issuance code. In addition, there are restrictions
 * such as an expiration date for the issued discount coupon, or that it is issued
 * only to customers who come in through a specific path.
 *
 * For more information, please refer to the properties and sub-entities below.
 *
 * @author Samchon
 */
export interface IHubCoupon {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * The person who designed the discount coupon.
   *
   * Each administrator and seller can design a discount coupon.
   */
  designer: IHubAdministrator.IInvert | IHubSeller.IInvert;

  /**
   * Discount information.
   */
  discount: IHubCouponDiscount;

  /**
   * Constraint information.
   */
  restriction: IHubCouponRestriction;

  /**
   * Inventory information.
   */
  inventory: IHubCouponInventory;

  /**
   * List of conditions for discount coupons.
   */
  criterias: IHubCouponCriteria[];

  /**
   * Representative name of discount coupon.
   */
  name: string;

  /**
   * The date and time the record was created.
   */
  created_at: string & tags.Format<"date-time">;

  /**
   * Issuance start date and time.
   */
  opened_at: null | (string & tags.Format<"date-time">);

  /**
   * Issuance End Date.
   *
   * Tickets cannot be issued after this point.
   *
   * However, previously issued tickets can still be used until their
   * {@link expired_at expiration date}.
   */
  closed_at: null | (string & tags.Format<"date-time">);
}
export namespace IHubCoupon {
  /**
   * Page request information.
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
      /**
       * The name of the discount coupon.
       */
      name?: string;
    }
    export type SortableColumns =
      | "coupon.name"
      | "coupon.value"
      | `coupon.unit`
      | "coupon.created_at"
      | "coupon.opened_at"
      | "coupon.closed_at";
  }

  /**
   * Enter discount coupon information.
   */
  export interface ICreate {
    /**
     * List of restrictions on discount coupons.
     */
    criterias: IHubCouponCriteria.ICreate[];

    /**
     * Discount information.
     */
    discount: IHubCouponDiscount;

    /**
     * Constraint information.
     */
    restriction: IHubCouponRestriction;

    /**
     * Representative name of discount coupon.
     */
    name: string;

    /**
     * The date and time the record was created.
     */
    opened_at: null | (string & tags.Format<"date-time">);

    /**
     * Issuance End Date.
     *
     * Tickets cannot be issued after this point.
     *
     * However, previously issued tickets can still be used until their
     * {@link expired_at expiration date}.
     */
    closed_at: null | (string & tags.Format<"date-time">);
  }

  export type IUpdate = ICreate;
}
