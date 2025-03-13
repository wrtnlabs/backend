import { tags } from "typia";

/**
 * Host information of the unit.
 *
 * Host connection information of the server that constitutes each listing unit.
 *
 * If {@link IHubCustomer customer} searches this information, the address
 * of the middleware API of this hub system is written. Conversely, if
 * {@link IHubSeller sales party} or {@link IHubAdministrator administrator}
 * searches this information, the commercial server API address registered by
 * the seller is written.
 *
 * @author Samchon
 */
export interface IHubSaleUnitHost {
  /**
   * The address of the actual server.
   */
  real: string & tags.Format<"uri">;

  /**
   * Address of the test server for development.
   */
  dev: null | (string & tags.Format<"uri">);
}
