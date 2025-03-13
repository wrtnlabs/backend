import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { TestGlobal } from "../../../../../TestGlobal";

export const validate_sale_at =
  (pool: ConnectionPool) =>
  (sale: IHubSale) =>
  async (visibleInCustomer: boolean) => {
    await validate((id) =>
      HubApi.functional.hub.admins.sales.at(pool.admin, id),
    )(sale);
    await validate((id) =>
      HubApi.functional.hub.sellers.sales.at(pool.seller, id),
    )(sale);

    if (visibleInCustomer)
      await validate((id) =>
        HubApi.functional.hub.customers.sales.at(pool.customer, id),
      )(sale);
    else
      await TestValidator.httpError("customer")(404, 422)(() =>
        validate((id) =>
          HubApi.functional.hub.customers.sales.at(pool.customer, id),
        )(sale),
      );
  };

const validate =
  (fetcher: (id: string) => Promise<IHubSale>) => async (sale: IHubSale) => {
    const read: IHubSale = await fetcher(sale.id);
    TestValidator.equals("read", TestGlobal.exceptSaleKeys)(sale)(read);
  };
