import { ArrayUtil, RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";
import { IHubSaleCollection } from "@wrtnlabs/os-api/lib/structures/hub/sales/collections/IHubSaleCollection";

import { ConnectionPool } from "../../../../../../ConnectionPool";
import { TestGlobal } from "../../../../../../TestGlobal";
import { generate_random_sale } from "../../internal/generate_random_sale";

export const generate_random_sale_collection = async (
  pool: ConnectionPool,
  input?: Partial<IHubSaleCollection.ICreate>,
): Promise<IHubSaleCollection.IForAdmin> => {
  return await HubApi.functional.hub.admins.sales.collections.create(
    pool.admin,
    {
      contents: [
        {
          title: RandomGenerator.paragraph()(),
          summary: RandomGenerator.content()()(),
          body: RandomGenerator.content()()(),
          format: "txt",
          lang_code: "en",
        },
        {
          title: RandomGenerator.paragraph()(),
          summary: RandomGenerator.content()()(),
          body: RandomGenerator.content()()(),
          format: "txt",
          lang_code: "ko",
        },
      ],

      sale_ids: await ArrayUtil.asyncRepeat(9)(async () => {
        const sale = await generate_random_sale(pool, "approved");
        return sale.id;
      }),
      background_color: "blue",
      thumbnail: TestGlobal.IMAGE_URL,
      ...(input ?? {}),
    },
  );
};
