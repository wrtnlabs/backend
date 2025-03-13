import { RandomGenerator, TestValidator } from "@nestia/e2e";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCitizen } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCitizen";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";

export const test_api_hub_customer_join = async (
  pool: ConnectionPool,
  connection?: HubApi.IConnection,
  input?: Partial<IHubMember.IJoin>,
  external?: IHubExternalUser.ICreate,
  lang_code?: IHubCustomer.LanguageType,
): Promise<IHubCustomer.IAuthorized & { member: IHubMember }> => {
  // 고객 레코드 생성 -> 회원도 시민도 아니다
  const issued: IHubCustomer.IAuthorized = await test_api_hub_customer_create(
    pool,
    connection,
    external,
    lang_code,
  );
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
    ...(input ?? {}),
  };

  await HubApi.functional.hub.customers.emails.verifications.send(
    connection ?? pool.customer,
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

  await HubApi.functional.hub.customers.emails.verifications.verify(
    connection ?? pool.customer,
    {
      code: verification.code,
      email: emended.email,
      type: "sign-up",
    },
  );

  const [joined, newbie] = await (async () => {
    try {
      const joined: IHubCustomer =
        await HubApi.functional.hub.customers.members.join(
          connection ?? pool.customer,
          { ...emended, code: verification.code },
        );
      return [joined, true];
    } catch (exp) {
      if (input?.email?.length)
        return [
          await HubApi.functional.hub.customers.members.login(
            connection ?? pool.customer,
            {
              email: input.email,
              password: input.password ?? TestGlobal.PASSWORD,
            },
          ),
          false,
        ];
      throw exp;
    }
  })();

  // 회원 정보와 시민 정보 검증
  if (newbie === true) {
    TestValidator.equals("joined.member")({
      emails: [
        {
          value: emended.email,
        },
      ],
      nickname: emended.nickname,
      citizen: emended.citizen as IHubCitizen | null,
    })(joined.member!);
    TestValidator.equals("joined.citizen")(emended.citizen)(joined.citizen);

    // 제일 처음 고객 레코드 발행시와 비교
    TestValidator.equals("issued vs joined")(
      typia.misc.clone<Omit<IHubCustomer, "created_at">>({
        ...issued,
        member: joined.member,
        citizen: joined.citizen,
        external_user: joined.external_user,
      }),
    )(joined);
  }

  return {
    ...joined,
    member: joined.member!,
    token: issued.token,
    setHeaders: issued.setHeaders,
  };
};
