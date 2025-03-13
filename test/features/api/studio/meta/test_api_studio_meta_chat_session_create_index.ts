import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "../accounts/internal/generate_random_account";
import { validate_api_studio_meta_chat_session } from "./internal/validate_api_studio_meta_chat_session";

export const test_api_studio_meta_chat_session_create_index = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool);
  await ArrayUtil.asyncRepeat(2)(async (i) => {
    const session: IStudioMetaChatSession =
      await HubApi.functional.studio.customers.meta.chat.sessions.create(
        pool.customer,
        {
          title: "something",
        },
      );
    if (i === 1)
      await validate_api_studio_meta_chat_session(pool, account, (provider) =>
        HubApi.functional.studio.customers.meta.chat.sessions.restart(
          pool.customer,
          session.id,
          {},
          provider,
        ),
      );
  });

  const page: IPage<IStudioMetaChatSession> =
    await HubApi.functional.studio.customers.meta.chat.sessions.index(
      pool.customer,
      {
        limit: 2,
      },
    );
  TestValidator.equals("length")(1)(page.data.length);
};
