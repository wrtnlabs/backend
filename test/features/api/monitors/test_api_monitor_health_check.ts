import HubApi from "@wrtnlabs/os-api";

import { ConnectionPool } from "../../../ConnectionPool";

export async function test_api_monitor_health_check(
  pool: ConnectionPool,
): Promise<void> {
  await HubApi.functional._health.get(pool.generate());
}
