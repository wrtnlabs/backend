import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubAdministrator } from "../actors/IHubAdministrator";
import { IHubCitizen } from "../actors/IHubCitizen";

/**
 * Deposit Donation.
 * {@link IHubDepositDonation} is an entity that embodies the case where
 * an administrator directly donates a deposit to a specific customer citizen.
 *
 * It is designed assuming that the customer will directly deliver the deposit
 * in person, rather than through our payment system.
 *
 * In some cases, it is also possible to sign a postpaid contract with a specific
 * company and provide the company with an appropriate amount of deposit every
 * month.
 *
 * @author Samchon
 */
export interface IHubDepositDonation {
  /**
   * Primary key
   */
  id: string & tags.Format<"uuid">;

  /**
   * Information about the administrator who managed the deposit contribution.
   */
  administrator: IHubAdministrator.IInvert;

  /**
   * Citizens who received deposit {@link IHubCitizen}
   */
  citizen: IHubCitizen;

  /**
   * The amount of deposit/withdrawal.
   *
   * Must be a positive number, and whether or not a deposit/withdrawal is made can be seen in {@link IHubDeposit.direction}.
   *
   * If you want to express the deposit/withdrawal values as positive/negative numbers, you can also multiply this field value by the {@link IHubDeposit.direction} value.
   */
  value: number & tags.Minimum<0>;

  /**
   * Reasons for granting deposit
   */
  reason: string;

  /**
   * Record creation date and time
   */
  created_at: string & tags.Format<"date-time">;
}

export namespace IHubDepositDonation {
  /**
   * Deposit contribution history inquiry and page information
   */
  export interface IRequest extends IPage.IRequest {
    /**
     * Search Conditions
     */
    search?: IRequest.ISearch;

    /**
     * Sorting Conditions
     */
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }

  export namespace IRequest {
    export interface ISearch {
      name?: string;
      mobile?: string & tags.Pattern<"^[0-9]*$">;
      minimum?: number & tags.Minimum<0>;
      maximum?: number & tags.Minimum<0>;
      from?: string & tags.Format<"date-time">;
      to?: string & tags.Format<"date-time">;
    }

    export type SortableColumns = "created_at" | "value";
  }

  /**
   * Deposit contribution creation information
   */
  export interface ICreate {
    /**
     * ID of the citizen who will receive the deposit
     */
    citizen_id: string & tags.Format<"uuid">;

    /**
     * The amount of deposit/withdrawal.
     *
     * Must be a positive number, and whether or not a deposit/withdrawal is made can be seen in {@link IHubDeposit.direction}.
     *
     * If you want to express the deposit/withdrawal values as positive/negative numbers, you can also multiply this field value by the {@link IHubDeposit.direction} value.
     */
    value: number & tags.Minimum<0>;

    /**
     * Reasons for granting deposit
     */
    reason: string;
  }
}
