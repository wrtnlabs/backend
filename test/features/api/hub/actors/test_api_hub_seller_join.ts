import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";
import { test_api_hub_customer_join } from "./test_api_hub_customer_join";

export const test_api_hub_seller_join = async (
  pool: ConnectionPool,
  input?: Partial<IHubMember.IJoin>,
  externalUser?: IHubExternalUser.ICreate,
): Promise<IHubSeller.IInvert> => {
  // 고객 토큰 발행
  await test_api_hub_customer_create(pool, pool.seller, externalUser);

  // 회원 가입
  const asset: IHubMember.IJoin = {
    email: `seller-${RandomGenerator.alphaNumeric(16)}@wrtn.io`,
    password: TestGlobal.PASSWORD,
    nickname: RandomGenerator.name(),
    citizen: {
      mobile: RandomGenerator.mobile(),
      name: RandomGenerator.name(),
    },
    ...(input ?? {}),
  };

  try {
    await test_api_hub_customer_join(pool, pool.seller, asset);
  } catch (exp) {
    return HubApi.functional.hub.sellers.authenticate.login(pool.seller, {
      email: asset.email,
      password: asset.password,
    });
  }

  const joined: IHubSeller.IInvert =
    await HubApi.functional.hub.sellers.authenticate.join(pool.seller, {});

  // 회원 정보와 시민 정보 검증
  TestValidator.equals("joined.member")({
    emails: [
      {
        value: asset.email,
      },
    ],
    nickname: asset.nickname,
  })(joined.member);
  TestValidator.equals("joined.citizen")(asset.citizen)(joined.citizen);

  return joined;
};
