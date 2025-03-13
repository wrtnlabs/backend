import { TestValidator } from "@nestia/e2e";
import HubApi from "@wrtnlabs/os-api";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";
import { v4 } from "uuid";

import { HubMemberProvider } from "../../../../../src/providers/hub/actors/HubMemberProvider";

import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_customer_create } from "./test_api_hub_customer_create";

export const test_api_hub_admin_login = async (
  pool: ConnectionPool,
): Promise<IHubAdministrator.IInvert> => {
  const input: IHubMember.IJoin = {
    email: "robot@nestia.io",
    password: TestGlobal.PASSWORD,
    nickname: "Robot",
    citizen: {
      mobile: "01012345678",
      name: "Robot",
    },
  };
  const customer: IHubCustomer = await test_api_hub_customer_create(
    pool,
    pool.admin,
  );
  const admin: IHubAdministrator.IInvert = await (async () => {
    const login = (): Promise<IHubAdministrator.IInvert> =>
      HubApi.functional.hub.admins.authenticate.login(pool.admin, {
        email: input.email,
        password: TestGlobal.PASSWORD,
      });
    try {
      return await login();
    } catch {
      const joined: IHubCustomer = await HubMemberProvider.join({
        customer,
        input,
      });
      await HubGlobal.prisma.hub_administrators.create({
        data: {
          id: v4(),
          member: {
            connect: { id: joined.member!.id },
          },
          created_at: new Date(),
        },
      });
      await HubGlobal.prisma.hub_sellers.create({
        data: {
          id: v4(),
          member: {
            connect: { id: joined.member!.id },
          },
          created_at: new Date(),
        },
      });
      return await login();
    }
  })();
  TestValidator.equals("passed")(input)({
    email: admin.member.emails[0].value,
    password: TestGlobal.PASSWORD,
    nickname: admin.member.nickname,
    citizen: admin.citizen!,
  });
  return admin;
};
