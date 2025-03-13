import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { ConnectionPool } from "../../../ConnectionPool";
import { test_api_hub_admin_login } from "../hub/actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../hub/actors/test_api_hub_customer_join";

export const test_api_admin_customer_access_elite_store = async (
  pool: ConnectionPool,
) => {
  // MEMBER CREATE
  const customer = await test_api_hub_customer_join(pool);

  await test_api_hub_customer_join(pool);
  const admin = await test_api_hub_admin_login(pool);
  const elite = await execute({ pool })(customer.member.id, null);

  TestValidator.equals("elite.member.id")(elite.member.id)(customer.member.id);
  TestValidator.equals("elite.administrator.id")(elite.administrator.id)(
    admin.id,
  );
};

const execute =
  (asset: { pool: ConnectionPool }) =>
  async (memberId: string, reason: string | null) => {
    const elite = await HubApi.functional.admin.access.elite.createElite(
      asset.pool.admin,
      {
        member_id: memberId,
        reason: reason,
      },
    );
    return elite;
  };
