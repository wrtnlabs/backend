import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";

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

export const test_api_hub_sale_question_index_sort = async (
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

  const validator = TestValidator.sort("questions.index")<
    IHubSaleQuestion.ISummary,
    IHubSaleQuestion.IRequest.SortableColumns,
    IPage.Sort<IHubSaleQuestion.IRequest.SortableColumns>
  >(async (input: IPage.Sort<IHubSaleQuestion.IRequest.SortableColumns>) => {
    const page: IPage<IHubSaleQuestion.ISummary> =
      await HubApi.functional.hub.customers.sales.questions.index(
        pool.customer,
        sale.id,
        {
          limit: REPEAT,
          sort: input,
        },
      );
    return page.data;
  });

  const components = [
    validator("created_at")(GaffComparator.dates((x) => x.created_at)),
    validator("updated_at")(GaffComparator.dates((x) => x.updated_at)),
    validator("answered_at")(
      GaffComparator.dates(
        (x) => x.answer?.created_at ?? new Date("9999-12-31").toISOString(),
      ),
    ),
    validator("title")(GaffComparator.strings((x) => x.title)),
    validator("nickname")(
      GaffComparator.strings((x) => x.customer.member!.nickname),
    ),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};

const REPEAT = 25;
