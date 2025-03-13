import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";

export const test_api_hub_customer_join_by_customer = async (
  pool: ConnectionPool,
): Promise<void> => {
  const customer = await test_api_hub_customer_create(pool);

  const email = `customer-${RandomGenerator.alphaNumeric(16)}@wrtn.io`;

  await HubApi.functional.hub.customers.emails.verifications.send(
    pool.customer,
    {
      email,
      type: "sign-up",
    },
  );

  const verification =
    await HubGlobal.prisma.hub_customer_email_verifications.findFirst({
      where: {
        hub_channel_id: customer.channel.id,
        hub_customer_id: customer.id,
        email,
        type: "sign-up" satisfies IHubCustomer.IEmailVerificationType,
      },
      orderBy: {
        created_at: "desc",
      },
    });

  if (!verification) {
    throw new Error("Verification Not Found.");
  }

  await HubApi.functional.hub.customers.emails.verifications.verify(
    pool.customer,
    {
      code: verification.code,
      email,
      type: "sign-up",
    },
  );

  await test_api_hub_customer_create(pool);

  const emended: IHubMember.IJoin = {
    email: verification.email,
    password: TestGlobal.PASSWORD,
    nickname: RandomGenerator.name(),
    citizen: null,
  };

  await TestValidator.httpError(
    "Customer is different. so couldn't find verification.",
  )(404)(() =>
    HubApi.functional.hub.customers.members.join(pool.customer, {
      ...emended,
      code: verification.code,
    }),
  );
};
