import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";

export const test_api_hub_customer_create = async (
  pool: ConnectionPool,
  connection?: HubApi.IConnection,
  externalUser?: IHubExternalUser.ICreate,
  lang_code?: IHubCustomer.LanguageType,
): Promise<IHubCustomer.IAuthorized> => {
  // 고객 레코드 발행
  const customer: IHubCustomer.IAuthorized =
    await HubApi.functional.hub.customers.authenticate.create(
      connection ?? pool.customer,
      {
        href: TestGlobal.HREF,
        referrer: TestGlobal.REFERRER,
        channel_code: pool.channel,
        external_user: externalUser ? externalUser : null,
        lang_code: lang_code ?? null,
      },
    );

  TestValidator.equals("citizen")(customer.citizen)(null);
  if (externalUser === null) {
    TestValidator.equals("external_user")(customer.external_user)(null);
    TestValidator.equals("member")(customer.member)(null);
  }
  return customer;
};
