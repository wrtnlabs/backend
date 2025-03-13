import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleQuestion } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleQuestion";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../internal/generate_random_sale";
import { generate_random_sale_question } from "../internal/generate_random_sale_question";

export const test_api_hub_sale_question_erase = async (
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

  await HubApi.functional.hub.customers.sales.questions.erase(
    pool.customer,
    sale.id,
    question.id,
  );

  await TestValidator.httpError("erase")(404)(() =>
    HubApi.functional.hub.customers.sales.questions.at(
      pool.customer,
      sale.id,
      question.id,
    ),
  );
};
