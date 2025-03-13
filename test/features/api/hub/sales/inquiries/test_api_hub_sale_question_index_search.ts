import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleQuestion } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleQuestion";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../internal/generate_random_sale";
import { generate_random_sale_inquiry_answer } from "../internal/generate_random_sale_inquiry_answer";
import { generate_random_sale_question } from "../internal/generate_random_sale_question";

export const test_api_hub_sale_question_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  const sale: IHubSale = await generate_random_sale(pool, "approved");
  await ArrayUtil.asyncRepeat(REPEAT)(async () => {
    await test_api_hub_customer_join(pool);
    const question: IHubSaleQuestion = await generate_random_sale_question(
      pool,
      sale,
    );
    if (Math.random() < 0.5)
      await generate_random_sale_inquiry_answer(pool, sale, question);
  });

  const expected: IPage<IHubSaleQuestion.ISummary> =
    await HubApi.functional.hub.customers.sales.questions.index(
      pool.customer,
      sale.id,
      {
        limit: REPEAT,
      },
    );

  const validator = TestValidator.search("search")(
    async (search: IHubSaleQuestion.IRequest.ISearch) => {
      const page: IPage<IHubSaleQuestion.ISummary> =
        await HubApi.functional.hub.customers.sales.questions.index(
          pool.customer,
          sale.id,
          {
            search,
            limit: REPEAT,
          },
        );
      return page.data;
    },
  )(expected.data, 2);

  // ATOMIC VALUES
  await validator({
    fields: ["name"],
    values: (arc) => [arc.customer.citizen!.name],
    request: ([name]) => ({ name }),
    filter: (arc, [name]) => arc.customer.citizen!.name === name,
  });
  await validator({
    fields: ["nickname"],
    values: (arc) => [
      arc.customer.member?.nickname ??
        arc.customer.external_user?.nickname ??
        "",
    ],
    request: ([nickname]) => ({ nickname }),
    filter: (arc, [nickname]) =>
      (
        arc.customer.member?.nickname ?? arc.customer.external_user?.nickname
      )?.includes(nickname) ?? false,
  });

  // CONTENT
  await validator({
    fields: ["title"],
    values: (arc) => [arc.title],
    request: ([title]) => ({ title }),
    filter: (arc, [title]) => arc.title.includes(title),
  });

  // VALIDATE ANSWERED STATE
  for (const flag of [true, false])
    await validator({
      fields: ["answered"],
      values: () => [flag],
      request: ([answered]) => ({ answered }),
      filter: (arc, [answered]) => !!arc.answer === answered,
    });
  await validator({
    fields: ["answered"],
    values: () => [null],
    request: ([answered]) => ({ answered }),
    filter: () => true,
  });
};

const REPEAT = 25;
