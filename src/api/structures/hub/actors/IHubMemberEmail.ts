import { tags } from "typia";

/**
 * Member's email address.
 *
 * This hub system allows one {@link IHubMember member} to have
 * multiple email accounts.
 *
 * This is because market participants are corporate entities and there is
 * room for them to work as freelancers for multiple companies.
 *
 * @author Samchon
 */
export interface IHubMemberEmail {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Email address.
   */
  value: string & tags.Format<"email">;

  /**
   * The date and time the record was created.
   */
  created_at: string & tags.Format<"date-time">;
}
