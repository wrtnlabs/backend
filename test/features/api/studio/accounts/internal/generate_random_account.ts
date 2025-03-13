import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_account = async (
  pool: ConnectionPool,
  input?: Partial<IStudioAccount.ICreate>,
): Promise<IStudioAccount> => {
  const account: IStudioAccount =
    await HubApi.functional.studio.customers.accounts.create(pool.customer, {
      code: RandomGenerator.alphabets(8),
      ...input,
    });
  return account;
};
