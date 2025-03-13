import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_enterprise = async (
  pool: ConnectionPool,
  input: Partial<IStudioEnterprise.ICreate> &
    (
      | Pick<IStudioEnterprise.ICreate.INew, "migrate" | "account">
      | Pick<
          IStudioEnterprise.ICreate.IMigrate,
          "migrate" | "new_account_for_customer"
        >
    ),
): Promise<IStudioEnterprise> => {
  const enterprise: IStudioEnterprise =
    await HubApi.functional.studio.customers.enterprises.create(pool.customer, {
      name: RandomGenerator.name(),
      ...(input as {
        migrate: false;
        account: string;
      }),
    });
  return enterprise;
};
