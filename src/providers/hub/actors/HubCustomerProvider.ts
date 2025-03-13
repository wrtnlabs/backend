import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCitizen } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCitizen";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";

import { HubGlobal } from "../../../HubGlobal";
import { JwtTokenService } from "../../../services/JwtTokenService";
import { JwtTokenManager } from "../../../utils/JwtTokenManager";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubChannelProvider } from "../systematic/HubChannelProvider";
import { HubCitizenProvider } from "./HubCitizenProvider";
import { HubExternalUserProvider } from "./HubExternalUserProvider";
import { HubMemberProvider } from "./HubMemberProvider";

export namespace HubCustomerProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_customersGetPayload<ReturnType<typeof select>>,
    ): IHubCustomer => ({
      id: input.id,
      type: "customer",
      channel: HubChannelProvider.json.transform(input.channel),
      citizen:
        input.citizen !== null
          ? HubCitizenProvider.json.transform(input.citizen)
          : null,
      external_user:
        input.external_user !== null
          ? HubExternalUserProvider.json.transform(input.external_user)
          : null,
      member:
        input.member !== null
          ? HubMemberProvider.json.transform(input.member)
          : null,
      href: input.href,
      referrer: input.referrer,
      ip: input.ip,
      readonly: input.readonly,
      lang_code:
        input.lang_code !== null
          ? typia.assert<IHubCustomer.LanguageType>(input.lang_code)
          : null,
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({
        include: {
          channel: HubChannelProvider.json.select(),
          citizen: HubCitizenProvider.json.select(),
          external_user: HubExternalUserProvider.json.select(),
          member: HubMemberProvider.json.select(),
        },
      }) satisfies Prisma.hub_customersFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const authorize = async (props: {
    level: "guest" | "member" | "citizen";
    request: {
      headers: {
        authorization?: string;
      };
    };
  }): Promise<IHubCustomer> => {
    const asset: JwtTokenManager.IAsset = await JwtTokenService.authorize({
      table: "hub_customers",
      request: props.request,
    });
    const record = await HubGlobal.prisma.hub_customers.findFirst({
      ...json.select(),
      where: { id: asset.id },
    });
    if (record === null)
      throw ErrorProvider.forbidden({
        accessor: "headers.authorization",
        code: HubActorErrorCode.INVALID_TOKEN,
        message: "tempered token",
      });

    const customer: IHubCustomer = HubCustomerProvider.json.transform(record);
    if (props.level === "member" && customer.member === null)
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You're not a member",
      });
    if (props.level === "citizen" && customer.citizen === null)
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_CITIZEN,
        message: "You're not a citizen",
      });
    return customer;
  };

  export const refresh = async (
    input?: string,
  ): Promise<IHubCustomer.IAuthorized> => {
    if (!input)
      throw ErrorProvider.unauthorized({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.INVALID_TOKEN,
        message: "No authorization token.",
      });
    else if (input.startsWith("Bearer "))
      input = input.substring("Bearer ".length);

    const decoded: JwtTokenManager.IAsset =
      await JwtTokenManager.verify("refresh")(input);
    if (decoded.table !== "hub_customers")
      throw ErrorProvider.unauthorized({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.INVALID_TOKEN,
        message: "Invalid authorization token.",
      });

    const record = await HubGlobal.prisma.hub_customers.findFirstOrThrow({
      where: { id: decoded.id },
      ...json.select(),
    });
    return tokenize(json.transform(record));
  };

  export const at = async (id: string): Promise<IHubCustomer> => {
    const customer = await HubGlobal.prisma.hub_customers.findFirstOrThrow({
      ...json.select(),
      where: { id },
    });
    return json.transform(customer);
  };

  const tokenize = async (
    customer: IHubCustomer,
    readonly: boolean = false,
  ): Promise<IHubCustomer.IAuthorized> => {
    const token: JwtTokenManager.IOutput = await JwtTokenManager.generate({
      table: "hub_customers",
      id: customer.id,
      readonly,
    });
    return {
      ...customer,
      token: {
        access: token.access,
        refresh: token.refresh,
        expired_at: token.expired_at,
        refreshable_until: token.refreshable_until,
      },
      setHeaders: {
        Authorization: "Bearer " + token.access,
      },
    };
  };

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    request: { ip: string };
    input: IHubCustomer.ICreate;
    readonly?: boolean;
  }): Promise<IHubCustomer.IAuthorized> => {
    const channel = await HubChannelProvider.get({
      code: props.input.channel_code,
      langCode: props.input.lang_code ?? "en",
    });
    const external_user = props.input.external_user
      ? await HubExternalUserProvider.emplace({
          channel,
          customer: null,
          input: props.input.external_user,
        })
      : null;
    const record = await HubGlobal.prisma.hub_customers.create({
      data: collect({
        channel,
        external_user,
        request: props.request,
        input: props.input,
      }),
      ...json.select(),
    });
    return tokenize(json.transform(record), !!props.readonly);
  };

  const collect = (props: {
    channel: IHubChannel;
    external_user: IHubExternalUser | null;
    request: { ip: string };
    input: IHubCustomer.ICreate;
  }) =>
    ({
      id: v4(),
      channel: { connect: { id: props.channel.id } },
      external_user:
        props.external_user !== null
          ? { connect: { id: props.external_user.id } }
          : undefined,
      citizen: props.external_user?.citizen?.id
        ? {
            connect: { id: props.external_user.citizen.id },
          }
        : undefined,
      member:
        props.external_user !== null && props.external_user.member_id
          ? { connect: { id: props.external_user.member_id } }
          : undefined,
      href: props.input.href,
      referrer: props.input.referrer,
      ip: props.input.ip ?? props.request.ip,
      readonly: !!props.input.readonly,
      lang_code: props.input.lang_code,
      created_at: new Date(),
    }) satisfies Prisma.hub_customersCreateInput;

  export const update = async (props: {
    customer: IHubCustomer;
    input: IHubCustomer.IUpdate;
  }): Promise<IHubCustomer> => {
    const record = await HubGlobal.prisma.hub_customers.update({
      where: { id: props.customer.id },
      data: {
        lang_code: props.input.lang_code,
      },
      ...json.select(),
    });
    return json.transform(record);
  };

  export const activate = async (props: {
    customer: IHubCustomer;
    input: IHubCitizen.ICreate;
  }): Promise<IHubCustomer> => {
    // VALIDATE CITIZZEN INFO
    const diagnoses: IDiagnosis[] = [];
    const inspect =
      (entity: string) => (target: IHubCitizen | null | undefined) => {
        if (target && target.mobile !== props.input.mobile)
          diagnoses.push({
            accessor: `input.citizen.mobile`,
            code: HubActorErrorCode.DIFFERENT_CITIZEN,
            message: `Different citizen information with ${entity}.`,
          });
      };
    inspect("member")(props.customer.member?.citizen);
    inspect("external user")(props.customer.external_user?.citizen);

    // EMPLACE CITIZEN
    const citizen = await HubCitizenProvider.create({
      channel: props.customer.channel,
      input: props.input,
    });
    await HubGlobal.prisma.hub_customers.update({
      where: { id: props.customer.id },
      data: {
        hub_citizen_id: citizen.id,
      },
    });

    // UPDATE REFERENCES
    if (
      props.customer.member !== null &&
      props.customer.member.citizen === null
    )
      await HubGlobal.prisma.hub_members.update({
        where: { id: props.customer.member.id },
        data: { citizen: { connect: { id: citizen.id } } },
      });
    if (
      props.customer.external_user !== null &&
      props.customer.external_user.citizen === null
    )
      await HubGlobal.prisma.hub_external_users.update({
        where: { id: props.customer.external_user.id },
        data: { citizen: { connect: { id: citizen.id } } },
      });

    // RETURNS WITH NEW TOKEN
    return {
      ...props.customer,
      member: props.customer.member
        ? { ...props.customer.member, citizen }
        : null,
      external_user: props.customer.external_user
        ? { ...props.customer.external_user, citizen }
        : null,
      citizen,
    };
  };

  /* -----------------------------------------------------------
    PREDICATORS
  ----------------------------------------------------------- */
  export const anonymous = (customer: IHubCustomer): IHubCustomer => ({
    id: v4(),
    type: "customer",
    citizen: {
      id: v4(),
      mobile: "0".repeat(11),
      name: "*******",
      created_at: new Date().toISOString(),
    },
    external_user: null,
    member: null,
    channel: customer.channel,
    href: customer.href,
    referrer: customer.referrer,
    ip: customer.ip,
    readonly: customer.readonly,
    lang_code: customer.lang_code,
    created_at: new Date().toISOString(),
  });

  export const equals =
    (x: IHubCustomer) =>
    (y: IHubCustomer): boolean =>
      x.id === y.id ||
      (x.citizen !== null && x.citizen.id === y.citizen?.id) ||
      (x.external_user !== null &&
        x.external_user.id === y.external_user?.id) ||
      (x.member !== null && x.member.id === y.member?.id);

  export const where = (actor: IHubActorEntity) =>
    (actor.type === "customer"
      ? {
          OR: [
            {
              id: actor.id,
            },
            ...(actor.external_user
              ? [{ hub_external_user_id: actor.external_user.id }]
              : []),
            ...(actor.member ? [{ hub_member_id: actor.member.id }] : []),
            ...(actor.citizen ? [{ hub_citizen_id: actor.citizen.id }] : []),
          ],
        }
      : {
          OR: [
            {
              id: actor.customer.id,
            },
            {
              hub_member_id: actor.member.id,
            },
          ],
        }) satisfies Prisma.hub_customersWhereInput;
}
