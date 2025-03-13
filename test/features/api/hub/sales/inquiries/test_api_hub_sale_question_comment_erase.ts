import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleQuestion } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleQuestion";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../internal/generate_random_sale";
import { generate_random_sale_inquiry_comment } from "../internal/generate_random_sale_inquiry_comment";
import { generate_random_sale_question } from "../internal/generate_random_sale_question";

export const test_api_hub_sale_question_comment_erase = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const question: IHubSaleQuestion = await generate_random_sale_question(
    pool,
    sale,
  );

  const comment = await generate_random_sale_inquiry_comment(
    pool,
    "customers",
    sale,
    question,
  );

  await HubApi.functional.hub.customers.sales.questions.comments.erase(
    pool.customer,
    sale.id,
    question.id,
    comment.id,
  );

  await TestValidator.httpError("erase")(404)(() =>
    HubApi.functional.hub.customers.sales.questions.comments.at(
      pool.customer,
      sale.id,
      question.id,
      comment.id,
    ),
  );

  const total =
    await HubApi.functional.hub.customers.sales.questions.comments.index(
      pool.customer,
      sale.id,
      question.id,
      {
        limit: REPEAT,
      },
    );

  TestValidator.equals("total")(total.data.includes(comment))(false);
};

const REPEAT = 10;
