import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";
import { IStudioMetaChatSessionShare } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionShare";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "../accounts/internal/generate_random_account";
import { validate_api_studio_meta_chat_session } from "./internal/validate_api_studio_meta_chat_session";

export const test_api_studio_meta_chat_session_share_index = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool);
  const entire: IStudioMetaChatSessionShare[] = await ArrayUtil.asyncRepeat(10)(
    async () => {
      const session: IStudioMetaChatSession =
        await validate_api_studio_meta_chat_session(pool, account, (provider) =>
          HubApi.functional.studio.customers.meta.chat.sessions.start(
            pool.customer,
            {},
            provider,
          ),
        );
      const share: IStudioMetaChatSessionShare =
        await HubApi.functional.studio.customers.meta.chat.sessions.shares.create(
          pool.customer,
          {
            title: "Test Title",
            session_id: session.id,
            message_id: null,
          },
        );
      return share;
    },
  );
  const page: IPage<IStudioMetaChatSessionShare> =
    await HubApi.functional.studio.customers.meta.chat.sessions.shares.index(
      pool.customer,
      {
        session_id: null,
        limit: entire.length,
        sort: ["+share.created_at"],
      },
    );
  TestValidator.equals("page.data", (key) => key !== "updated_at")(page.data)(
    entire,
  );
};
