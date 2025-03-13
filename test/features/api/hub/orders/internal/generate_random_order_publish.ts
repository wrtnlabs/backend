import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderPublish } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderPublish";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_order_publish = async (
  pool: ConnectionPool,
  order: IHubOrder,
  input?: Partial<IHubOrderPublish.ICreate>,
): Promise<IHubOrderPublish> => {
  const publish: IHubOrderPublish =
    await HubApi.functional.hub.customers.orders.publish.create(
      pool.customer,
      order.id,
      {
        opened_at: new Date().toISOString(),
        closed_at: null,
        ...input,
      },
    );
  return publish;
};
