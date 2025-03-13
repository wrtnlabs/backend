import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";

export const test_api_hub_customer_join_not_verified = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 고객 레코드 생성 -> 회원도 시민도 아니다
  const issued: IHubCustomer.IAuthorized =
    await test_api_hub_customer_create(pool);
  TestValidator.equals("issued.member")(false)(!!issued.member);
  TestValidator.equals("issued.citizen")(false)(!!issued.citizen);

  // 회원 가입 실시
  const emended: IHubMember.IJoin = {
    email: `customer-${RandomGenerator.alphaNumeric(16)}@wrtn.io`,
    password: TestGlobal.PASSWORD,
    nickname: RandomGenerator.name(),
    citizen: {
      mobile: RandomGenerator.mobile(),
      name: RandomGenerator.name(),
    },
  };

  await HubApi.functional.hub.customers.emails.verifications.send(
    pool.customer,
    {
      email: emended.email,
      type: "sign-up",
    },
  );

  const now = new Date();

  const verification =
    await HubGlobal.prisma.hub_customer_email_verifications.findFirst({
      where: {
        hub_customer_id: issued.id,
        hub_channel_id: issued.channel.id,
        email: emended.email,
        type: "sign-up" satisfies IHubCustomer.IEmailVerificationType,
        verified_at: null,
        deleted_at: null,
        expired_at: { gt: now.toISOString() },
      },
      orderBy: {
        created_at: "desc",
      },
    });

  if (!verification) {
    throw new Error("Verification not found.");
  }

  await TestValidator.httpError("Verification not verified.")(400)(() =>
    HubApi.functional.hub.customers.members.join(pool.customer, {
      ...emended,
      code: verification.code,
    }),
  );
};
