import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { HubSaleInquiryErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleInquiryErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";

import { HubGlobal } from "../../../../../HubGlobal";
import { ErrorProvider } from "../../../../common/ErrorProvider";

export namespace HubSaleInquiryLikeProvider {
  export const create = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    inquiry: IEntity;
  }) => {
    if (props.actor.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You're not a member.",
      });
    }

    await find(props);
    await HubGlobal.prisma.hub_sale_snapshot_inquiry_likes.create({
      data: {
        id: v4(),
        inquiry: {
          connect: {
            id: props.inquiry.id,
          },
        },
        customer: {
          connect: {
            id:
              props.actor.type === "customer" ? props.actor.id : props.actor.id,
          },
        },
        member: {
          connect: {
            id: props.actor.member.id,
          },
        },
        created_at: new Date(),
      },
    });
  };

  export const erase = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    inquiry: IEntity;
  }) => {
    if (props.actor.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You're not a member.",
      });
    }
    await find(props);

    const record =
      await HubGlobal.prisma.hub_sale_snapshot_inquiry_likes.findFirst({
        where: {
          hub_sale_snapshot_inquiry_id: props.inquiry.id,
          member: {
            id: props.actor.member.id,
          },
        },
      });
    if (record === null) {
      throw ErrorProvider.notFound({
        code: HubSaleInquiryErrorCode.LIKE_NOT_FOUND,
        message: "Like not found.",
      });
    }
    await HubGlobal.prisma.hub_sale_snapshot_inquiry_likes.delete({
      where: {
        id: record.id,
      },
    });
  };

  const find = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    inquiry: IEntity;
  }) => {
    if (props.actor.member === null) {
      throw ErrorProvider.forbidden({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You're not a member.",
      });
    }

    const sale = await HubGlobal.prisma.hub_sales.findFirst({
      where: {
        id: props.sale.id,
      },
    });
    if (sale === null) {
      throw ErrorProvider.notFound({
        accessor: `${props.sale.id} in path`,
        code: HubSaleErrorCode.SALE_NOT_FOUND,
        message: "Sale not found.",
      });
    }

    const inquiry =
      await HubGlobal.prisma.hub_sale_snapshot_inquiries.findFirst({
        where: {
          id: props.inquiry.id,
        },
      });
    if (inquiry === null) {
      throw ErrorProvider.notFound({
        accessor: `${props.inquiry.id} in path`,
        code: HubSaleInquiryErrorCode.INQUIRY_NOT_FOUND,
        message: "Inquiry not found.",
      });
    }
  };
}
