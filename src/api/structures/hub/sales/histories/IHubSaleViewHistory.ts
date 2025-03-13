import typia from "typia";

import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

/**
 * Property search history.
 *
 * @author Asher
 */
export interface IHubSaleViewHistory {
  /**
   * Id of the corresponding search history.
   */
  id: string & typia.tags.Format<"uuid">;

  /**
   * Sale summary information for that search history.
   */
  sale: IHubSale.ISummary;

  /**
   * The date and time of record creation for the corresponding search history.
   */
  created_at: string & typia.tags.Format<"date-time">;
}
