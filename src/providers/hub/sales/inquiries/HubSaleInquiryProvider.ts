import { Prisma } from "@prisma/client";

import { IHubSaleInquiry } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiry";

import { BbsArticleProvider } from "../../../common/BbsArticleProvider";
import { HubCitizenProvider } from "../../actors/HubCitizenProvider";

export namespace HubSaleInquiryProvider {
  export const search = (input: IHubSaleInquiry.IRequest.ISearch | undefined) =>
    [
      // BASIC ARTICLE
      ...BbsArticleProvider.search(input).map((base) => ({ base })),

      // MEMBER AND CITIZEN
      ...HubCitizenProvider.search(input).map((citizen) => ({
        customer: { citizen },
      })),
      ...(input?.nickname?.length
        ? [
            {
              customer: {
                member: {
                  nickname: {
                    contains: input.nickname,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          ]
        : []),

      // ANSWERED
      ...(typeof input?.answered === "boolean"
        ? [
            {
              answer: input.answered === true ? { isNot: null } : { is: null },
            },
          ]
        : []),
    ] satisfies Prisma.hub_sale_snapshot_inquiriesWhereInput["AND"];

  export const orderBy = (
    key: IHubSaleInquiry.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    (key === "nickname"
      ? {
          customer: {
            member: {
              nickname: direction,
            },
          },
        }
      : key === "answered_at"
        ? {
            answer: {
              base: {
                created_at: direction,
              },
            },
          }
        : {
            base: BbsArticleProvider.orderBy(key, direction),
          }) satisfies Prisma.hub_sale_snapshot_inquiriesOrderByWithRelationInput;
}
