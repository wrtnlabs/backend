import { tags } from "typia";

/**
 * @todo
 * @author Asher
 */
export interface IHubSaleInquiryLike {
  id: string & tags.Format<"uuid">;
}

export namespace IHubSaleInquiryLike {}
