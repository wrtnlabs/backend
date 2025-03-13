import { tags } from "typia";

import { IHubSection } from "../systematic/IHubSection";
import { IHubCouponCriteriaBase } from "./IHubCouponCriteriaBase";

/**
 * Conditions for a section of a discount coupon.
 *
 * `IHubCouponCriteriaOfSection` is a subtype entity of
 * {@link IHubCouponCriteriaBase}, and is used to set conditions for a specific
 * {@link IHubSection}.
 *
 * If the {@link direction} value is "include", the coupon can only be used for
 * that section, and if it is "exclude", the coupon cannot be used.
 *
 * @author Samchon
 */
export interface IHubCouponCriteriaOfSection
  extends IHubCouponCriteriaBase<"section"> {
  /**
   * Section List.
   *
   * A list of sections to include or exclude.
   */
  sections: IHubSection[] & tags.MinItems<1>;
}
export namespace IHubCouponCriteriaOfSection {
  export interface ICreate extends IHubCouponCriteriaBase.ICreate<"section"> {
    /**
     * A list of {@link IHubSection.code} target sections.
     */
    section_codes: string[] & tags.MinItems<1>;
  }
}
