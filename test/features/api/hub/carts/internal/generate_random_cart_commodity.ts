import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { prepare_random_cart_commodity } from "./prepare_random_cart_commodity";

export async function generate_random_cart_commodity(
  pool: ConnectionPool,
  sale: IHubSale,
  input: Partial<IHubCartCommodity.ICreate> = {},
): Promise<IHubCartCommodity> {
  const item: IHubCartCommodity =
    await HubApi.functional.hub.customers.carts.commodities.create(
      pool.customer,
      null,
      prepare_random_cart_commodity(sale, input),
    );
  return item;
}
