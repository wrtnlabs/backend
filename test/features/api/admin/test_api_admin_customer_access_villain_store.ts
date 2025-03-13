import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { ConnectionPool } from "../../../ConnectionPool";
import { test_api_hub_admin_login } from "../hub/actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../hub/actors/test_api_hub_customer_join";

export const test_api_admin_customer_access_villain_store = async (
  pool: ConnectionPool,
) => {
  // MEMBER CREATE
  const customer = await test_api_hub_customer_join(pool);

  await test_api_hub_customer_join(pool);
  const admin = await test_api_hub_admin_login(pool);

  const villain = await execute({ pool })(customer.member.id, null);

  TestValidator.equals("villain.member.id")(villain.member.id)(
    customer.member.id,
  );
  TestValidator.equals("villain.administrator.id")(villain.administrator.id)(
    admin.id,
  );
};

const execute =
  (asset: { pool: ConnectionPool }) =>
  async (memberId: string, reason: string | null) => {
    const villain = await HubApi.functional.admin.access.villain.createVillain(
      asset.pool.admin,
      {
        member_id: memberId,
        reason: reason,
      },
    );
    return villain;
  };
