import { ArrayUtil, RandomGenerator } from "@nestia/e2e";
import { randint } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { prepare_random_attachment_file } from "../../../common/prepare_random_attachment_file";

export const generate_random_sale_audit = async (
  pool: ConnectionPool,
  sale: IHubSale,
): Promise<IHubSaleAudit> => {
  const audit: IHubSaleAudit =
    await HubApi.functional.hub.admins.sales.audits.create(
      pool.admin,
      sale.id,
      {
        title: RandomGenerator.paragraph()(),
        body: RandomGenerator.content()()(),
        format: "txt",
        files: ArrayUtil.repeat(randint(0, 3))(() =>
          prepare_random_attachment_file(),
        ),
      },
    );
  return audit;
};
