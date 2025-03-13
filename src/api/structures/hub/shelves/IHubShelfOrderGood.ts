import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";

import { IHubOrderGood } from "../orders/IHubOrderGood";

export interface IHubShelfOrderGood {
  /**
   * Primary Key.
   *
   * Actually {@link IHubOrderGood.id} itself.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Reverse reference of the product.
   */
  good: IHubOrderGood.IInvert;

  /**
   * A list of schedules to execute this function.
   */
  schedule_state: null | "active" | "paused";
}
export namespace IHubShelfOrderGood {
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
      good?: IHubOrderGood.IRequest.ISearch;
      schedule_state?: null | "active" | "paused";
    }

    export type SortableColumns = IHubOrderGood.IRequest.SortableColumns;
  }
}
