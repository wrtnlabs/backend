import fs from "fs";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { HubConfiguration } from "../../../../../src/HubConfiguration";
import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_customer_join } from "../../hub/actors/test_api_hub_customer_join";
import { generate_random_account } from "../accounts/internal/generate_random_account";
import { validate_api_studio_meta_chat_session } from "./internal/validate_api_studio_meta_chat_session";

export const test_api_studio_meta_chat_session_report = async (
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

  const url: string = `${HubGlobal.env.HUB_API_HOST}/studio/customers/meta/chat/sessions/${session.id}/__report.zip`;
  const response: Response = await fetch(url);
  const buffer: Buffer = Buffer.from(await response.arrayBuffer());
  try {
    await fs.promises.mkdir(`${HubConfiguration.ROOT}/packages/public`, {
      recursive: true,
    });
  } catch {}
  await fs.promises.writeFile(
    `${HubConfiguration.ROOT}/packages/public/__report.zip`,
    buffer,
  );
};
