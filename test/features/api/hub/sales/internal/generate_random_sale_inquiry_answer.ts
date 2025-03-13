import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleInquiry } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiry";
import { IHubSaleInquiryAnswer } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiryAnswer";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_sale_inquiry_answer = async (
  pool: ConnectionPool,
  sale: IHubSale,
  inquiry: IHubSaleInquiry<"question" | "review", any>,
): Promise<IHubSaleInquiryAnswer> => {
  const answer: IHubSaleInquiryAnswer =
    await HubApi.functional.hub.sellers.sales[`${inquiry.type}s`].create(
      pool.seller,
      sale.id,
      inquiry.id,
      {
        title: RandomGenerator.paragraph()(),
        body: RandomGenerator.content()()(),
        format: "txt",
        files: [],
      },
    );
  return answer;
};
