import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleQuestion } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleQuestion";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../../actors/test_api_hub_customer_create";
import { test_api_hub_customer_join } from "../../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../internal/generate_random_sale";
import { generate_random_sale_question } from "../internal/generate_random_sale_question";

export const test_api_hub_sale_question_secret = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  const question: IHubSaleQuestion = await generate_random_sale_question(
    pool,
    sale,
    { secret: true },
  );

  // 당사자는 열람 가능
  const read: IHubSaleQuestion =
    await HubApi.functional.hub.customers.sales.questions.at(
      pool.customer,
      sale.id,
      question.id,
    );
  TestValidator.equals("read")(question)(read);

  // 다른 고객은 열람 불가
  await test_api_hub_customer_create(pool);
  await TestValidator.httpError("secret")(403)(() =>
    HubApi.functional.hub.customers.sales.questions.at(
      pool.customer,
      sale.id,
      question.id,
    ),
  );

  // 단, 목록에서는 보이되, 마스킹 처리가 되어있다.
  const page: IPage<IHubSaleQuestion.ISummary> =
    await HubApi.functional.hub.customers.sales.questions.index(
      pool.customer,
      sale.id,
      {
        limit: 1,
        sort: ["-created_at"],
      },
    );
  TestValidator.equals("index")(question.id)(page.data[0]?.id);
  TestValidator.predicate("masked")(() => {
    const top: IHubSaleQuestion.ISummary = page.data[0];
    return (
      top.title.includes("*") &&
      top.customer.member === null &&
      top.customer.citizen !== null &&
      top.customer.citizen.name.includes("*") &&
      top.customer.citizen.mobile === "0".repeat(11)
    );
  });
};
