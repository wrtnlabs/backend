import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioAccountSecret } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecret";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_account_secret = async (
  pool: ConnectionPool,
  account: IStudioAccount,
  input?: Partial<IStudioAccountSecret.ICreate>,
): Promise<IStudioAccountSecret> => {
  const variable: IStudioAccountSecret =
    await HubApi.functional.studio.customers.accounts.secrets.create(
      pool.customer,
      account.code,
      {
        key: RandomGenerator.alphabets(16),
        values: [
          {
            code: "something",
            value: RandomGenerator.alphaNumeric(16),
            expired_at: null,
            scopes: [],
          },
        ],
        title: RandomGenerator.name(8),
        description: RandomGenerator.paragraph()(),
        ...input,
      },
    );
  return variable;
};
