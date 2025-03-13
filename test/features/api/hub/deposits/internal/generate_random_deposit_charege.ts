import { randint } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubDepositCharge } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositCharge";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_deposit_charge = async (
  pool: ConnectionPool,
  value?: number,
): Promise<IHubDepositCharge> => {
  const charge: IHubDepositCharge =
    await HubApi.functional.hub.customers.deposits.charges.create(
      pool.customer,
      {
        value: value ?? randint(100, 2_000) * 10_000,
      },
    );
  return charge;
};
