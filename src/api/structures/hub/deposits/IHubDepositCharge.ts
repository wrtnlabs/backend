import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubCustomer } from "../actors/IHubCustomer";
import { IHubDepositChargePublish } from "./IHubDepositChargePublish";

/**
 * Customer deposit deposit request.
 *
 * Deposits refer to the amount that customers have prepaid and charged in advance.
 *
 * Due to the nature of the API as a transaction object, this Generative-Hub cannot
 * immediately pay cash at the time of purchase of goods (API call time). Instead,
 * this system charges the customer with a deposit and deducts it every time the
 * API is called. And {@link IHubDepositCharge} is an entity that visualizes this
 * "deposit request" for the deposit.
 *
 * In other words, {@link IHubDepositCharge} is only the stage where the customer
 * expresses his/her intention to deposit the deposit, and note that the deposit
 * has not yet been completed.
 *
 * @author Samchon
 */
export interface IHubDepositCharge {
  /**
   * Primary key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Customers who have applied for a deposit.
   */
  customer: IHubCustomer;

  /**
   * The amount of deposit/withdrawal.
   *
   * Must be a positive number, and whether or not a deposit/withdrawal
   * is made can be seen in {@link IHubDeposit.direction}.
   *
   * If you want to express the deposit/withdrawal values as positive/negative
   * numbers, you can also multiply this field value by the
   * {@link IHubDeposit.direction} value.
   */
  value: number & tags.ExclusiveMinimum<0>;

  /**
   * The date and time the record was created.
   */
  created_at: string & tags.Format<"date-time">;

  /**
   * Payment progress information for deposit of deposit.
   */
  publish: null | IHubDepositChargePublish;
}
export namespace IHubDepositCharge {
  /**
   * View deposit application information and page information.
   */
  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      minimum?: number;
      maximum?: number;
      from?: string & tags.Format<"date-time">;
      to?: string & tags.Format<"date-time">;
      state: "pending" | "published" | "paid" | "cancelled";
      publish?: {
        from?: string & tags.Format<"date-time">;
        to?: string & tags.Format<"date-time">;
        payment?: {
          from?: string & tags.Format<"date-time">;
          to?: string & tags.Format<"date-time">;
        };
      };
    }
    export type SortableColumns =
      | "created_at"
      | "value"
      | "publish.created_at"
      | "publish.paid_at"
      | "publish.cancelled_at";
  }

  /**
   * Modify deposit request information.
   */
  export interface ICreate {
    /**
     * The amount of deposit/withdrawal.
     *
     * Must be a positive number, and whether or not a deposit/withdrawal is made can be seen in {@link IHubDeposit.direction}.
     *
     * If you want to express the deposit/withdrawal values as positive/negative numbers, you can also multiply this field value by the {@link IHubDeposit.direction} value.
     */
    value: number & tags.ExclusiveMinimum<0>;
  }
  export type IUpdate = ICreate;
}
