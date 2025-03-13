import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleQuestion } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleQuestion";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_sale_question = async (
  pool: ConnectionPool,
  sale: IHubSale,
  input?: Partial<IHubSaleQuestion.ICreate>,
): Promise<IHubSaleQuestion> => {
  const question: IHubSaleQuestion =
    await HubApi.functional.hub.customers.sales.questions.create(
      pool.customer,
      sale.id,
      {
        title: RandomGenerator.paragraph()(),
        body: RandomGenerator.content()()(),
        format: "txt",
        files: [],
        secret: false,
        ...(input ?? {}),
      },
    );
  return question;
};
