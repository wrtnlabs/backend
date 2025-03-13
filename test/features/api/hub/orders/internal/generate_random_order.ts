import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_order = async (
  pool: ConnectionPool,
  commodities: IHubCartCommodity[],
): Promise<IHubOrder> => {
  const order: IHubOrder = await HubApi.functional.hub.customers.orders.create(
    pool.customer,
    {
      goods: commodities.map((commodity) => ({ commodity_id: commodity.id })),
    },
  );
  return order;
};
