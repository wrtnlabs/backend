import { Prisma } from "@prisma/client";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { IAdminCustomerAggregate } from "@wrtnlabs/os-api/lib/structures/admin/IAdminCustomerAggregate";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { HubGlobal } from "../../HubGlobal";
import { PaginationUtil } from "../../utils/PaginationUtil";
import { ErrorProvider } from "../common/ErrorProvider";
import { HubAdministratorProvider } from "../hub/actors/HubAdministratorProvider";
import { HubCitizenProvider } from "../hub/actors/HubCitizenProvider";
import { HubExternalUserProvider } from "../hub/actors/HubExternalUserProvider";
import { HubMemberEmailProvider } from "../hub/actors/HubMemberEmailProvider";
import { HubMemberProvider } from "../hub/actors/HubMemberProvider";
import { HubSellerProvider } from "../hub/actors/HubSellerProvider";
import { AdminCustomerAccessProvider } from "./AdminCustomerAccessProvider";

export namespace AdminCustomerAggregateProvider {
  export namespace json {
    export const select = () =>
      ({
        include: {
          citizen: HubCitizenProvider.json.select(),
          seller: HubSellerProvider.json.select(),
          administrator: HubAdministratorProvider.json.select(),
          emails: HubMemberEmailProvider.json.select(),
          external_user: HubExternalUserProvider.json.select(),
          account: true,

          elite: AdminCustomerAccessProvider.elite.json.select(),
          villain: AdminCustomerAccessProvider.villain.json.select(),
        },
      }) satisfies Prisma.hub_membersFindManyArgs;

    export const transform = (
      input: Prisma.hub_membersGetPayload<ReturnType<typeof select>>,
    ): IAdminCustomerAggregate => {
      return {
        id: input.id,
        member: {
          ...HubMemberProvider.json.transform(input),
        },

        elite:
          input.elite !== null
            ? input.elite.map(AdminCustomerAccessProvider.elite.json.transform)
            : null,
        villain:
          input.villain !== null
            ? input.villain
                .map(AdminCustomerAccessProvider.villain.json.transform)
                .sort()
            : null,
      };
    };
  }

  export namespace summary {
    export const select = () =>
      ({
        include: {
          citizen: HubCitizenProvider.json.select(),
          seller: HubSellerProvider.json.select(),
          administrator: HubAdministratorProvider.json.select(),
          emails: HubMemberEmailProvider.json.select(),
          external_user: HubExternalUserProvider.json.select(),
          account: true,

          elite: AdminCustomerAccessProvider.elite.json.select(),
          villain: AdminCustomerAccessProvider.villain.json.select(),
        },
      }) satisfies Prisma.hub_membersFindManyArgs;

    export const transform = (
      input: Prisma.hub_membersGetPayload<ReturnType<typeof select>>,
    ): IAdminCustomerAggregate.ISummary => {
      return {
        id: input.id,
        member: {
          ...HubMemberProvider.json.transform(input),
        },
        elite: input.elite.length
          ? AdminCustomerAccessProvider.elite.json.transform(
              input.elite.sort(
                (a, b) => b.created_at.getTime() - a.created_at.getTime(),
              )[0],
            )
          : null,
        villain: input.villain.length
          ? AdminCustomerAccessProvider.villain.json.transform(
              input.villain.sort(
                (a, b) => b.created_at.getTime() - a.created_at.getTime(),
              )[0],
            )
          : null,
      };
    };
  }

  export const index = async (props: {
    actor: IHubCustomer;
    input: IAdminCustomerAggregate.IRequest;
  }): Promise<IPage<IAdminCustomerAggregate.ISummary>> => {
    if (props.actor.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "only member can access this resource.",
      });
    }

    if (props.actor.member.administrator === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_ADMINISTRATOR,
        message: "only administrator can access this resource.",
      });
    }

    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_members,
      payload: summary.select(),
      transform: summary.transform,
    })({
      where: {
        AND: [...(await search(props.input.search))],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    })(props.input);
  };

  const orderBy = (
    key: IAdminCustomerAggregate.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    (key === "member.created_at"
      ? { created_at: direction }
      : key === "member.nickname"
        ? { nickname: direction }
        : {}) satisfies Prisma.hub_membersOrderByWithRelationInput;

  const search = async (
    input: IAdminCustomerAggregate.IRequest.ISearch | undefined,
  ) =>
    [
      ...(input?.id !== undefined ? [{ id: input.id }] : []),
      ...(input?.ids?.length ? [{ id: { in: input.ids } }] : []),
      ...(input?.channel_codes?.length
        ? [{ channel: { code: { in: input.channel_codes } } }]
        : []),
      ...(input?.email !== undefined
        ? [
            {
              emails: {
                some: {
                  value: {
                    contains: input.email,
                  },
                },
              },
            },
          ]
        : []),
      ...(input?.nickname !== undefined
        ? [
            {
              nickname: {
                contains: input.nickname,
              },
            },
          ]
        : []),
      ...(input?.member
        ? [
            ...(input.member.type !== undefined
              ? input.member.type === "members"
                ? [{ seller: null, administrator: null }]
                : input.member.type === "sellers"
                  ? [{ seller: { isNot: null } }]
                  : []
              : []),

            ...(input.member.from !== undefined
              ? [{ created_at: { gte: new Date(input.member.from) } }]
              : []),

            ...(input.member.to !== undefined
              ? [{ created_at: { lte: new Date(input.member.to) } }]
              : []),

            ...(input.member.access_type !== undefined
              ? input.member.access_type === "elite"
                ? [
                    {
                      elite: {
                        some: {
                          member: {
                            id: input.id,
                          },
                        },
                      },
                    },
                  ]
                : input.member.access_type === "villain"
                  ? [
                      {
                        villain: {
                          some: {
                            member: {
                              id: input.id,
                            },
                          },
                        },
                      },
                    ]
                  : []
              : []),
          ]
        : []),
    ] satisfies Prisma.hub_membersWhereInput["AND"];
}
