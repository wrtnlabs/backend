import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubAuthenticateKey } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAuthenticateKey";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubChannelProvider } from "../systematic/HubChannelProvider";
import { HubCustomerProvider } from "./HubCustomerProvider";

export namespace HubAuthenticateProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_authenticate_tokensGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubAuthenticateKey => ({
      id: input.id,
      title: input.title,
      value: input.value,
      expired_at: input.expired_at?.toISOString(),
      created_at: input.created_at.toISOString(),
    });

    export const select = () =>
      ({}) satisfies Prisma.hub_authenticate_tokensFindManyArgs;
  }

  export const index = async (props: {
    customer: IHubCustomer;
    input: IHubAuthenticateKey.ISearch;
  }): Promise<IPage<IHubAuthenticateKey>> => {
    if (props.customer.member === null) {
      throw ErrorProvider.notFound({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Member not found.",
      });
    }

    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_authenticate_tokens,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        ...where(props.customer.member),
        AND: await search(props.input),
        deleted_at: null,
      },
      orderBy: [
        {
          expired_at: "desc",
        },
      ],
    } satisfies Prisma.hub_authenticate_tokensFindManyArgs)(props.input);
  };

  const where = (member: IEntity) =>
    ({
      hub_member_id: member.id,
      deleted_at: null,
    }) satisfies Prisma.hub_authenticate_tokensWhereInput;

  const search = async (input: IHubAuthenticateKey.ISearch | undefined) =>
    [
      ...(input?.search?.title !== undefined
        ? [
            {
              title: {
                contains: input.search.title,
                mode: "insensitive" as const,
              },
            },
          ]
        : []),
    ] satisfies Prisma.hub_authenticate_tokensWhereInput["AND"];

  export const create = async (props: {
    customer: IHubCustomer;
    input: IHubAuthenticateKey.ICreate;
  }): Promise<IHubAuthenticateKey> => {
    if (props.customer.member === null) {
      throw ErrorProvider.notFound({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Member not found.",
      });
    }

    const langCode = LanguageUtil.getNonNullActorLanguage(props.customer);
    const channel = await HubChannelProvider.get({
      code: props.input.channel_code,
      langCode,
    });
    await HubGlobal.prisma.hub_authenticate_tokens.findFirst({
      where: {
        customer: HubCustomerProvider.where(props.customer),
        channel: { id: channel.id },
        deleted_at: null,
      },
    });

    const token = await HubGlobal.prisma.hub_authenticate_tokens.create({
      data: collect({
        channel,
        customer: props.customer,
        member: props.customer.member,
        input: props.input,
      }),
    });
    return json.transform(token);
  };

  const collect = (props: {
    channel: IHubChannel;
    customer: IEntity;
    member: IEntity;
    input: IHubAuthenticateKey.ICreate;
  }) =>
    ({
      id: v4(),
      channel: { connect: { id: props.channel.id } },
      customer: { connect: { id: props.customer.id } },
      member: { connect: { id: props.member.id } },
      title: props.input.title ?? "default", // TODO: default title
      value: v4(), // TODO token
      created_at: new Date(),
    }) satisfies Prisma.hub_authenticate_tokensCreateInput;

  export const deprecate = async (props: {
    customer: IHubCustomer;
    id: string;
  }): Promise<void> => {
    const token =
      await HubGlobal.prisma.hub_authenticate_tokens.findFirstOrThrow({
        where: {
          id: props.id,
          customer: HubCustomerProvider.where(props.customer),
        },
      });
    if (!token)
      throw ErrorProvider.notFound({
        code: HubActorErrorCode.TOKEN_NOT_FOUND,
        message: "Authentication token not found.",
      });
    await HubGlobal.prisma.hub_authenticate_tokens.update({
      where: {
        id: token.id,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  };

  export const at = async (props: {
    customer: IHubCustomer;
    id: string;
  }): Promise<IHubAuthenticateKey> => {
    if (props.customer.member === null) {
      throw ErrorProvider.notFound({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Member not found.",
      });
    }

    const token =
      await HubGlobal.prisma.hub_authenticate_tokens.findFirstOrThrow({
        where: {
          id: props.id,
          ...where(props.customer.member),
        },
      });
    return json.transform(token);
  };
}
