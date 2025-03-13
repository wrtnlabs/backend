import { ArrayUtil, TestValidator } from "@nestia/e2e";
import { sleep_for } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";
import { IStudioMetaChatSessionMessage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionMessage";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "../accounts/internal/generate_random_account";
import { validate_api_studio_meta_chat_session } from "./internal/validate_api_studio_meta_chat_session";

export const test_api_studio_meta_chat_session_message_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_customer_join(pool);
  const account: IStudioAccount = await generate_random_account(pool);
  const session: IStudioMetaChatSession =
    await validate_api_studio_meta_chat_session(pool, account, (provider) =>
      HubApi.functional.studio.customers.meta.chat.sessions.start(
        pool.customer,
        {},
        provider,
      ),
    );
  await ArrayUtil.asyncRepeat(9)(() =>
    validate_api_studio_meta_chat_session(pool, account, (provider) =>
      HubApi.functional.studio.customers.meta.chat.sessions.restart(
        pool.customer,
        session.id,
        {},
        provider,
      ),
    ),
  );
  await sleep_for(500);

  const entire: IPage<IStudioMetaChatSessionMessage> =
    await HubApi.functional.studio.customers.meta.chat.sessions.messages.index(
      pool.customer,
      session.id,
      {
        limit: 100,
        sort: ["+message.created_at"],
      },
    );
  const search = TestValidator.search("search")(
    async (search: IStudioMetaChatSessionMessage.IRequest.ISearch) => {
      const page: IPage<IStudioMetaChatSessionMessage> =
        await HubApi.functional.studio.customers.meta.chat.sessions.messages.index(
          pool.customer,
          session.id,
          {
            limit: 100,
            search,
          },
        );
      return page.data;
    },
  )(entire.data);

  await search({
    fields: ["from"],
    values: (m) => [m.created_at],
    request: ([from]) => ({ from }),
    filter: (m, [from]) =>
      new Date(from).getTime() <= new Date(m.created_at).getTime(),
  });
  await search({
    fields: ["to"],
    values: (m) => [m.created_at],
    request: ([to]) => ({ to }),
    filter: (m, [to]) =>
      new Date(m.created_at).getTime() <= new Date(to).getTime(),
  });
  await search({
    fields: ["from", "to"],
    values: (m) => [
      new Date(new Date(m.created_at).getTime() - 250).toISOString(),
      new Date(new Date(m.created_at).getTime() + 250).toISOString(),
    ],
    request: ([from, to]) => ({
      from,
      to,
    }),
    filter: (m, [from, to]) =>
      new Date(from).getTime() <= new Date(m.created_at).getTime() &&
      new Date(m.created_at).getTime() <= new Date(to).getTime(),
  });
};
