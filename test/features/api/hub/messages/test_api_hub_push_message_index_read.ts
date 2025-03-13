import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubPushMessage } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessage";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";

export const test_api_hub_push_message_index_read = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);

  const total: IHubPushMessage[] = await ArrayUtil.asyncRepeat(10)(() =>
    HubApi.functional.hub.admins.push_messages.create(pool.admin, {
      code: RandomGenerator.alphabets(16),
      source: RandomGenerator.alphabets(16),
      target: "customer",
      content: {
        title: RandomGenerator.paragraph(3)(3),
        body: RandomGenerator.paragraph(3)(3),
      },
    }),
  );
  const page: IPage<IHubPushMessage> =
    await HubApi.functional.hub.admins.push_messages.index(pool.admin, {
      limit: 999_999_999,
    });
  TestValidator.equals("index")(total)(page.data.slice(-10));
};
