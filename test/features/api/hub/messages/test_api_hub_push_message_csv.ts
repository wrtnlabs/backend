import fs from "fs";

import HubApi from "@wrtnlabs/os-api/lib/index";

import { HubConfiguration } from "../../../../../src/HubConfiguration";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";

export const test_api_hub_push_message_csv = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await HubApi.functional.hub.admins.push_messages.csv(pool.admin, {
    file: new File(
      [
        await fs.promises.readFile(
          `${HubConfiguration.ROOT}/assets/raw/raw_hub_push_messages.csv`,
        ),
      ],
      "raw_hub_push_messages.csv",
    ),
  });
};
