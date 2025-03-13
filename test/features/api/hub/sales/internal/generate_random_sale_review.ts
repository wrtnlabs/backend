import { ArrayUtil, RandomGenerator } from "@nestia/e2e";
import { randint } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubSaleReview } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleReview";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { prepare_random_attachment_file } from "../../../common/prepare_random_attachment_file";

export const generate_random_sale_review = async (
  pool: ConnectionPool,
  good: IHubOrderGood,
  input?: Partial<IHubSaleReview.ICreate>,
): Promise<IHubSaleReview> => {
  const review: IHubSaleReview =
    await HubApi.functional.hub.customers.sales.reviews.create(
      pool.customer,
      good.commodity.sale.id,
      {
        good_id: good.id,
        title: RandomGenerator.paragraph()(),
        body: RandomGenerator.content()()(),
        format: "txt",
        files: ArrayUtil.repeat(randint(0, 3))(() =>
          prepare_random_attachment_file("png"),
        ),
        score: randint(0, 10) * 10,
        ...input,
      },
    );
  return review;
};
