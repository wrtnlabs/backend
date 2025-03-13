import { ForbiddenException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubAdministratorDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/actors";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

import { HubGlobal } from "../../../HubGlobal";
import { JwtTokenService } from "../../../services/JwtTokenService";
import { JwtTokenManager } from "../../../utils/JwtTokenManager";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubChannelProvider } from "../systematic/HubChannelProvider";
import { HubCitizenProvider } from "./HubCitizenProvider";
import { HubExternalUserProvider } from "./HubExternalUserProvider";
import { HubMemberProvider } from "./HubMemberProvider";

export namespace HubAdministratorProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_administratorsGetPayload<ReturnType<typeof select>>,
    ): IHubAdministrator => ({
      id: input.id,
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({}) satisfies Prisma.hub_administratorsFindManyArgs;
  }

  export namespace invert {
    export const transform = (
      customer: Prisma.hub_customersGetPayload<ReturnType<typeof select>>,
      error: (message: string) => Error = () =>
        ErrorProvider.internal({
          code: CommonErrorCode.INTERNAL_SERVER_ERROR,
          message: "expected to administrator, but it isn't.",
        }),
    ): IHubAdministrator.IInvert => {
      const member = customer.member;
      if (member === null) throw error("not a member.");

      const citizen = member.citizen;
      const administrator = member.administrator;

      if (administrator === null) throw error("not an administrator.");

      return {
        id: administrator.id,
        type: "administrator",
        citizen:
          citizen !== null ? HubCitizenProvider.json.transform(citizen) : null,
        member: HubMemberProvider.invert.transform(member),
        customer: {
          id: customer.id,
          channel: HubChannelProvider.json.transform(customer.channel),
          external_user:
            customer.external_user !== null
              ? HubExternalUserProvider.json.transform(customer.external_user)
              : null,
          href: customer.href,
          referrer: customer.referrer,
          ip: customer.ip,
          readonly: customer.readonly,
          lang_code:
            customer.lang_code !== null
              ? typia.assert<IHubCustomer.LanguageType>(customer.lang_code)
              : null,
          created_at: customer.created_at.toISOString(),
        },
        created_at: administrator.created_at.toISOString(),
      };
    };
    export const select = () =>
      ({
        include: {
          channel: HubChannelProvider.json.select(),
          external_user: HubExternalUserProvider.json.select(),
          member: {
            include: {
              ...HubMemberProvider.invert.select().include,
              administrator: true,
            },
          },
        },
      }) satisfies Prisma.hub_customersFindManyArgs;
  }

  /* -----------------------------------------------------------
          READERS
    ----------------------------------------------------------- */
  export const authorize = async (request: {
    headers: {
      authorization?: string;
    };
  }): Promise<IHubAdministrator.IInvert> => {
    const asset: JwtTokenManager.IAsset = await JwtTokenService.authorize({
      table: "hub_customers",
      request,
    });
    const customer = await HubGlobal.prisma.hub_customers.findFirst({
      where: { id: asset.id },
      ...invert.select(),
    });
    if (customer === null)
      throw ErrorProvider.forbidden({
        accessor: "headers.authorization",
        code: HubActorErrorCode.INVALID_TOKEN,
        message: "tempered token",
      });
    return invert.transform(
      customer,
      (msg) => new ForbiddenException(`You're ${msg}`),
    );
  };

  /* -----------------------------------------------------------
        WRITERS
    ----------------------------------------------------------- */
  export const join = async (props: {
    customer: IHubCustomer;
    input: object;
  }): Promise<IHubAdministrator.IInvert> => {
    if (props.customer.member === null)
      throw ErrorProvider.forbidden({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You've not joined as a member yet.",
      });
    else if (props.customer.member.administrator !== null)
      throw ErrorProvider.gone({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.ALREADY_JOINED_ADMINISTRATOR,
        message: "You've already joined as a administrator.",
      });

    const record = await HubGlobal.prisma.hub_administrators.create({
      data: {
        id: v4(),
        member: {
          connect: { id: props.customer.member.id },
        },
        created_at: new Date(),
      },
      ...json.select(),
    });
    return HubAdministratorDiagnoser.invert({
      ...props.customer,
      member: {
        ...props.customer.member,
        administrator: json.transform(record),
      },
    })!;
  };

  export const login = async (props: {
    customer: IHubCustomer;
    input: IHubMember.ILogin;
  }): Promise<IHubAdministrator.IInvert> => {
    const customer = await HubMemberProvider.login(props);
    if (!customer.member?.administrator)
      throw ErrorProvider.forbidden({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.NOT_ADMINISTRATOR,
        message: "You've not joined as a administrator yet.",
      });
    return HubAdministratorDiagnoser.invert(customer)!;
  };
}
