import { tags } from "typia";

/**
 * Citizen authentication information.
 *
 * {@link IHubCitizen} is an entity that records the user's real name and
 * mobile phone input information.
 *
 * For reference, in Korea, real name authentication is mandatory for
 * e-commerce participants, so the {@link name} attribute is important. However,
 * the situation is different overseas, so in reality, the {@link mobile} attribute
 * is the most important, and individual user identification is also based on this
 * {@link mobile} attribute.
 *
 * Of course, real name and mobile phone authentication information are encrypted
 * and stored.
 *
 * @author Samchon
 */
export interface IHubCitizen extends IHubCitizen.ICreate {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * The date and time the record was created.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubCitizen {
  /**
   * Enter citizen authentication information.
   */
  export interface ICreate {
    /**
     * Mobile phone number.
     */
    mobile: string & tags.Pattern<"^[0-9]*$">;

    /**
     * Real name or equivalent name.
     */
    name: string;
  }

  export namespace IRequest {
    export interface ISearch {
      mobile?: string & tags.Pattern<"^[0-9]*$">;
      name?: string;
    }
  }
}
