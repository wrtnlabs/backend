import { ArrayUtil, GaffComparator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
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

export const test_api_hub_sale_question_comment_index_sort = async (
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
  await ArrayUtil.asyncRepeat(REPEAT)(async () => {
    const actor = Math.random() < 0.5 ? "customers" : "sellers";
    if (actor === "customers") await test_api_hub_customer_join(pool);
    await generate_random_sale_inquiry_comment(pool, actor, sale, question);
  });

  const validator = TestValidator.sort("comments.index")<
    IHubSaleInquiryComment,
    IHubSaleInquiryComment.IRequest.SortableColumns,
    IPage.Sort<IHubSaleInquiryComment.IRequest.SortableColumns>
  >(async (
    input: IPage.Sort<IHubSaleInquiryComment.IRequest.SortableColumns>,
  ) => {
    const page: IPage<IHubSaleInquiryComment> =
      await HubApi.functional.hub.customers.sales.questions.comments.index(
        pool.customer,
        sale.id,
        question.id,
        {
          limit: REPEAT,
          sort: input,
        },
      );
    return page.data;
  });

  const components = [
    validator("created_at")(GaffComparator.dates((x) => x.created_at)),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};
const REPEAT = 25;
