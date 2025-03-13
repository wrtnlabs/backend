import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleInquiry } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiry";
import { IHubSaleInquiryComment } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiryComment";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_sale_inquiry_comment = async (
  pool: ConnectionPool,
  actor: "customers" | "sellers",
  sale: IHubSale,
  inquiry: IHubSaleInquiry<"question" | "review", any>,
  input?: Partial<IHubSaleInquiryComment.ICreate>,
): Promise<IHubSaleInquiryComment> => {
  const comment: IHubSaleInquiryComment = await HubApi.functional.hub[
    actor
  ].sales[`${inquiry.type}s`].comments.create(
    actor === "customers" ? pool.customer : pool.seller,
    sale.id,
    inquiry.id,
    {
      format: "txt",
      body: RandomGenerator.content()()(),
      files: [],
      ...(input ?? {}),
    },
  );
  return comment;
};
