import { tags } from "typia";

/**
 * Parameter information for the listing unit.
 *
 * Definition of additional parameters to be sent to the seller server.
 *
 * @author Asher
 */
export interface IHubSaleUnitParameter extends IHubSaleUnitParameter.ICreate {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Record creation time.
   */
  created_at: string & tags.Format<"date-time">;

  /**
   * Date and time of record modification.
   */
  updated_at: string & tags.Format<"date-time">;
}

export namespace IHubSaleUnitParameter {
  /**
   * Parameter input information.
   */
  export interface ICreate {
    /**
     * Key value.
     */
    key: string;

    /**
     * The Value for the corresponding Key value.
     */
    value: string;

    /**
     * Parameter type.
     *
     * Currently cookie type is not supported.
     */
    in: "query" | "header";

    /**
     * Description of the key
     */
    description: string | null;
  }

  /**
   * Parameter modification information.
   *
   * Only values and descriptions can be edited.
   */
  export interface IUpdate {
    /**
     * The Value for the corresponding Key value.
     */
    value: string;

    /**
     * Description of the key
     */
    description: string | null;
  }
}
