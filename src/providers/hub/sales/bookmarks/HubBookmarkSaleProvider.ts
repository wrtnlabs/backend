import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubSaleAuditErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleAuditErrorCode";
import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubBookmarkSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/bookmarks/IHubBookmarkSale";

import { HubGlobal } from "../../../../HubGlobal";
import { LanguageUtil } from "../../../../utils/LanguageUtil";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubMemberProvider } from "../../actors/HubMemberProvider";
import { HubSaleProvider } from "../HubSaleProvider";

export namespace HubBookmarkSaleProvider {
  export namespace json {
    export const select = (actor: IHubActorEntity) =>
      ({
        include: {
          sale: HubSaleProvider.json.select(actor, "approved"),
          member: HubMemberProvider.json.select(),
        },
      }) satisfies Prisma.hub_bookmark_salesFindManyArgs;

    export const transform = async (
      input: Prisma.hub_bookmark_salesGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubBookmarkSale> => {
      return {
        id: input.id,
        sale: await HubSaleProvider.json.transform(input.sale, lang_code),
        created_at: input.created_at.toISOString(),
      };
    };
  }

  export namespace summarize {
    export const select = (actor: IHubActorEntity) =>
      ({
        include: {
          sale: HubSaleProvider.summary.select(actor, "approved"),
        },
      }) satisfies Prisma.hub_bookmark_salesFindManyArgs;
    export const transform = async (
      input: Prisma.hub_bookmark_salesGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubBookmarkSale.ISummary> => {
      return {
        id: input.id,
        sale: await HubSaleProvider.summary.transform(input.sale, lang_code),
        created_at: input.created_at.toISOString(),
      };
    };
  }

  export const create = async (props: {
    customer: IHubCustomer;
    sale: IEntity;
  }): Promise<IHubBookmarkSale> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Member not joined.",
      });
    }

    const langCode = LanguageUtil.getNonNullActorLanguage(props.customer);
    const sale = await HubGlobal.prisma.hub_sales.findFirst({
      where: {
        id: props.sale.id,
      },
    });
    if (sale === null) {
      throw ErrorProvider.notFound({
        code: HubSaleAuditErrorCode.NOT_FOUND,
        message: "Sale not found.",
      });
    }

    const record = await HubGlobal.prisma.hub_bookmark_sales.create({
      data: collect({
        sale,
        member: props.customer.member,
        customer: props.customer,
      }),
      ...json.select(props.customer),
    });
    return json.transform(record, langCode);
  };

  const collect = (props: {
    sale: IEntity;
    member: IEntity;
    customer: IEntity;
  }) =>
    ({
      id: v4(),
      sale: {
        connect: {
          id: props.sale.id,
        },
      },
      member: {
        connect: {
          id: props.member.id,
        },
      },
      customer: {
        connect: {
          id: props.customer.id,
        },
      },
      created_at: new Date(),
    }) satisfies Prisma.hub_bookmark_salesCreateInput;

  export const erase = async (props: {
    customer: IHubCustomer;
    sale: IEntity;
  }) => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Member not joined.",
      });
    }

    const record = await HubGlobal.prisma.hub_bookmark_sales.findFirst({
      where: {
        sale: {
          id: props.sale.id,
        },
      },
      ...json.select(props.customer),
    });
    if (record === null) {
      throw ErrorProvider.notFound({
        code: HubSaleErrorCode.BOOKMARK_NOT_FOUND,
        message: "Bookmark not found",
      });
    }

    if (record.hub_member_id !== props.customer.member.id) {
      throw ErrorProvider.forbidden({
        code: HubSaleErrorCode.BOOKMARK_NOT_YOURS,
        message: "Bookmark not yours.",
      });
    }
    await HubGlobal.prisma.hub_bookmark_sales.delete({
      where: {
        id: record.id,
      },
    });
  };
}
