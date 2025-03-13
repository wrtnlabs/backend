import { ForbiddenException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubSellerDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/actors";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";

import { HubGlobal } from "../../../HubGlobal";
import { JwtTokenService } from "../../../services/JwtTokenService";
import { JwtTokenManager } from "../../../utils/JwtTokenManager";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubChannelProvider } from "../systematic/HubChannelProvider";
import { HubCitizenProvider } from "./HubCitizenProvider";
import { HubExternalUserProvider } from "./HubExternalUserProvider";
import { HubMemberProvider } from "./HubMemberProvider";

export namespace HubSellerProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_sellersGetPayload<ReturnType<typeof select>>,
    ): IHubSeller => ({
      id: input.id,
      created_at: input.created_at.toISOString(),
    });
    export const select = () => ({}) satisfies Prisma.hub_sellersFindManyArgs;
  }
  export namespace invert {
    export const transform = (
      customer: Prisma.hub_customersGetPayload<ReturnType<typeof select>>,
      error: (message: string) => Error = () =>
        ErrorProvider.internal({
          code: CommonErrorCode.INTERNAL_SERVER_ERROR,
          message: "expected to seller, but it isn't.",
        }),
    ): IHubSeller.IInvert => {
      const member = customer.member;
      if (member === null) throw error("not a member.");

      //        const citizen = member.citizen;
      const seller = member.seller;

      //        if (citizen === null) throw error("not a citizen.");
      if (seller === null) throw error("not a seller.");

      return {
        id: seller.id,
        type: "seller",
        citizen:
          member.citizen === null
            ? null
            : HubCitizenProvider.json.transform(member.citizen),
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
        created_at: seller.created_at.toISOString(),
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
              seller: true,
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
  }): Promise<IHubSeller.IInvert> => {
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

  export const searchFromCustomer = (
    input: IHubSeller.IRequest.ISearch | undefined,
  ) =>
    [
      ...(input?.id?.length ? [{ member: { seller: { id: input.id } } }] : []),
      ...HubCitizenProvider.search(input).map((citizen) => ({ citizen })),
      ...(input?.email?.length
        ? [{ member: { emails: { some: { value: input.email } } } }]
        : []),
      ...(input?.nickname?.length
        ? [{ member: { nickname: input.nickname } }]
        : []),
      ...(input?.show_wrtn !== undefined
        ? input.show_wrtn === true
          ? [
              {
                member: {
                  emails: { some: { value: HubGlobal.env.STORE_EMAIL } },
                },
              },
            ]
          : input.show_wrtn === false
            ? [
                {
                  member: {
                    emails: { none: { value: HubGlobal.env.STORE_EMAIL } },
                  },
                },
              ]
            : []
        : []),
    ] satisfies Prisma.hub_customersWhereInput["AND"];

  export const whereFromCustomerField = (seller: IEntity) =>
    ({
      member: {
        seller: {
          id: seller.id,
        },
      },
    }) satisfies Prisma.hub_salesWhereInput;

  export const orderBy = (
    key: IHubSeller.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "seller.created_at"
      ? { created_at: value }
      : {
          created_at: value,
        }) satisfies Prisma.hub_sellersOrderByWithRelationInput; // @todo -> statistics

  /* -----------------------------------------------------------
          WRITERS
      ----------------------------------------------------------- */
  export const join = async (props: {
    customer: IHubCustomer;
    input: IHubSeller.IJoin;
  }): Promise<IHubSeller.IInvert> => {
    if (props.customer.member === null)
      throw ErrorProvider.forbidden({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You've not joined as a member yet.",
      });
    else if (props.customer.member.seller !== null)
      throw ErrorProvider.gone({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.ALREADY_JOINED_SELLER,
        message: "You've already joined as a seller.",
      });
    //      else if (customer.member.citizen === null)
    //        throw ErrorProvider.forbidden({
    //          accessor: "headers.Authorization",
    //          code: HubActorErrorCode.NOT_CITIZEN,
    //          message: "You've not activated as a citizen yet.",
    //        });

    const record = await HubGlobal.prisma.hub_sellers.create({
      data: {
        id: v4(),
        member: {
          connect: { id: props.customer.member.id },
        },
        created_at: new Date(),
      },
      ...json.select(),
    });
    return HubSellerDiagnoser.invert({
      ...props.customer,
      member: {
        ...props.customer.member,
        seller: json.transform(record),
      },
    })!;
  };

  export const login = async (props: {
    customer: IHubCustomer;
    input: IHubMember.ILogin;
  }): Promise<IHubSeller.IInvert> => {
    const customer = await HubMemberProvider.login(props);
    if (!customer.member?.seller)
      throw ErrorProvider.forbidden({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.NOT_JOINED_SELLER,
        message: "You've not joined as a seller yet.",
      });
    return HubSellerDiagnoser.invert(customer)!;
  };
}
