import { tags } from "typia";

/**
 *  Content of the push message.
 *
 *  @author Samchon
 */
export interface IHubPushMessageContent {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   *  Title of the push message.
   */
  title: string;

  /**
   *  Body of the push message.
   */
  body: string;

  /**
   *  Creation time or update timme of the push message content.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubPushMessageContent {
  /**
   *  Creation information of the push message content.
   */
  export interface ICreate {
    /**
     *  Title of the push message.
     */
    title: string;

    /**
     *  Body of the push message.
     */
    body: string;
  }

  export interface ISearch {
    title?: string;
    body?: string;
    title_or_body?: string;
  }
}
