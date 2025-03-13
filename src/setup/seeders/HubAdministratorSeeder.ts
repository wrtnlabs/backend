import { v4 } from "uuid";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { HubCustomerProvider } from "../../providers/hub/actors/HubCustomerProvider";
import { HubMemberProvider } from "../../providers/hub/actors/HubMemberProvider";

import { HubGlobal } from "../../HubGlobal";

export namespace HubAdministratorSeeder {
  export const seed = async (): Promise<void> => {
    const customer: IHubCustomer = await HubCustomerProvider.create({
      request: {
        ip: "127.0.0.1",
      },
      input: {
        external_user: {
          application: "google",
          uid: v4(),
          nickname: "김뤼튼",
          citizen: null,
          data: '{"gender":"f", "job":"designer", "birthYear":1990}',
          content: null,
          password: v4(),
        },
        channel_code: "wrtn",
        href: "http://localhost/TestAutomation",
        referrer: "http://localhost/NodeJS",
        lang_code: null,
      },
    });
    const joined: IHubCustomer = await HubMemberProvider.join({
      customer,
      input: {
        email: "robot@wrtn.io",
        password: HubGlobal.env.HUB_SYSTEM_PASSWORD,
        nickname: "Robot",
        citizen: {
          mobile: "01012345678",
          name: "김뤼튼",
        },
      },
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
  };
}
