import { tags } from "typia";

import { IHubCouponCriteriaBase } from "./IHubCouponCriteriaBase";

/**
 * Limiting the inflow path of discount coupons.
 *
 * {@link IHubCouponCriteriaOfFunnel} is a subtype entity of
 * {@link IHubCouponCriteria}, and is used when you want to issue or exclude
 * {@link IHubCoupon discount coupons} only to customers who come from
 * a specific path.
 *
 * And limiting the inflow path is possible in three ways as follows. First is
 * {@link IHubCustomer.referrer}, and in addition, by parsing
 * {@link IHubCustomer.href}, which records the customer's access address,
 * restrictions can be applied to specific URLs or variable units.
 *
 * @author Samchon
 */
export interface IHubCouponCriteriaOfFunnel
  extends IHubCouponCriteriaBase<"funnel"> {
  /**
   * A list of individual conditions for each inflow path.
   */
  funnels: Array<IHubCouponCriteriaOfFunnel.IFunnel> & tags.MinItems<1>;
}
export namespace IHubCouponCriteriaOfFunnel {
  /**
   * Individual conditions for each inflow path.
   */
  export type IFunnel = IPathFunnel | IReferrerFunnel | IVariableFunnel;

  /**
   * Restricting inflow paths through Path values.
   */
  export interface IPathFunnel {
    /**
     * Type of inflow path.
     *
     * - url: URL path address accessed
     */
    kind: "url";

    /**
     * Path value.
     */
    value: string & tags.Format<"uri">;
  }

  /**
   * Restricting inflow paths through Referrer address values.
   */
  export interface IReferrerFunnel {
    /**
     * Type of inflow path.
     *
     * - referrer: Referrer address of the inflow before accessing this site.
     */
    kind: "referrer";

    /**
     * Inflow path value.
     */
    value: string & tags.Format<"uri">;
  }

  /**
   * Limiting inflow paths through variables.
   */
  export interface IVariableFunnel {
    /**
     * Type of inflow path.
     *
     * - variable: URL query
     */
    kind: "variable";

    /**
     * Key value in URL query.
     */
    key: string;

    /**
     * The value in the URL query.
     */
    value: string;
  }

  export interface ICreate extends IHubCouponCriteriaBase.ICreate<"funnel"> {
    /**
     * A list of individual conditions for each inflow path.
     */
    funnels: Array<IFunnel> & tags.MinItems<1>;
  }
}
