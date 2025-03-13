import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleInquiryComment } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiryComment";
import { IHubSaleQuestion } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleQuestion";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../internal/generate_random_sale";
import { generate_random_sale_inquiry_comment } from "../internal/generate_random_sale_inquiry_comment";
import { generate_random_sale_question } from "../internal/generate_random_sale_question";

export const test_api_hub_sale_question_comment_update = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const question: IHubSaleQuestion = await generate_random_sale_question(
    pool,
    sale,
  );

  const validate = async (actor: "customers" | "sellers") => {
    const comment: IHubSaleInquiryComment =
      await generate_random_sale_inquiry_comment(pool, actor, sale, question);
    comment.snapshots.push(
      ...(await ArrayUtil.asyncRepeat(3)(async () => {
        const snapshot: IHubSaleInquiryComment.ISnapshot =
          await HubApi.functional.hub[actor].sales.questions.comments.update(
            actor === "customers" ? pool.customer : pool.seller,
            sale.id,
            question.id,
            comment.id,
            {
              format: "txt",
              body: RandomGenerator.content()()(),
              files: [],
            },
          );
        return snapshot;
      })),
    );

    const read: IHubSaleInquiryComment =
      await HubApi.functional.hub.customers.sales.questions.comments.at(
        pool.customer,
        sale.id,
        question.id,
        comment.id,
      );
    TestValidator.equals(actor)(comment)(read);
  };
  await validate("customers");
  await validate("sellers");
};
