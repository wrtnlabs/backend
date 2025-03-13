import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { ICheckPrivacy } from "@wrtnlabs/os-api/lib/structures/common/ICheckPrivacy";

import { ConnectionPool } from "../../../ConnectionPool";
import { test_api_hub_customer_join } from "../hub/actors/test_api_hub_customer_join";

export const test_api_common_check_privacy = async (pool: ConnectionPool) => {
  await test_api_hub_customer_join(pool);

  const privacy: ICheckPrivacy.IInvalid[] =
    await HubApi.functional.hub.customers.commons.check.privacy.checkPrivacy(
      pool.customer,
      {
        text: CHECK_PRIVACY_TARGET,
      },
    );

  TestValidator.equals("970101-1234567")(privacy[0].word)("970101-1234567");
  TestValidator.equals("주민등록번호")(privacy[0].regex)("주민등록번호");

  TestValidator.equals("leo@wrtn.io")(privacy[1].word)("leo@wrtn.io");
  TestValidator.equals("Email")(privacy[1].regex)("Email");

  TestValidator.equals("010-0000-0000")(privacy[2].word)("010-0000-0000");
  TestValidator.equals("전화번호")(privacy[2].regex)("전화번호");

  TestValidator.equals("하나은행")(privacy[3].word)("하나은행");
  TestValidator.equals("은행(증권)이름")(privacy[3].regex)("은행(증권)이름");
};
const CHECK_PRIVACY_TARGET = [
  "970101-1234567",
  "leo@wrtn.io",
  "010-0000-0000",
  "하나은행",
];
