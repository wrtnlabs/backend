import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSaleCollection } from "@wrtnlabs/os-api/lib/structures/hub/sales/collections/IHubSaleCollection";

import { HubGlobal } from "../../../../HubGlobal";
import { LanguageUtil } from "../../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../../utils/PaginationUtil";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubSaleProvider } from "../HubSaleProvider";
import { HubSaleCollectionContentProvider } from "./HubSaleCollectionContentProvider";

export namespace HubSaleCollectionProvider {
  export namespace json {
    export const select = (actor: IHubActorEntity) =>
      ({
        include: {
          elements: {
            include: {
              sale: HubSaleProvider.summary.select(actor, "approved"),
            },
            where: {
              sale: {
                AND: HubSaleProvider.where(actor, true),
              },
            },
          },
          contents: HubSaleCollectionContentProvider.selectWithWhere(
            HubSaleCollectionContentProvider.json.select(),
            actor,
          ),
        },
      }) satisfies Prisma.hub_sale_collectionsFindManyArgs;

    export const transform = async (
      input: Prisma.hub_sale_collectionsGetPayload<ReturnType<typeof select>>,
      langCode: IHubCustomer.LanguageType,
    ): Promise<IHubSaleCollection> => {
      const found = input.contents.find((c) => c.lang_code === langCode);

      const content = found
        ? found
        : await HubSaleCollectionContentProvider.emplace({
            collection: { id: input.id },
            langCode: langCode,
          });

      const sales = await ArrayUtil.asyncMap(
        input.elements.sort((a, b) => a.sequence - b.sequence),
      )((s) => HubSaleProvider.summary.transform(s.sale, langCode));
      return {
        id: input.id,
        title: content.title,
        summary: content.summary,
        body: content.body ?? null,
        background_color: typia.assert<IHubSaleCollection.CollectionColorType>(
          input.background_color,
        ),
        lang_code: content.lang_code,
        format: typia.assert<IHubSaleCollection.Type>(content.format),
        sale_count: sales.length,
        thumbnail: input.thumbnail,
        sales: sales,
        created_at: input.created_at.toISOString(),
      };
    };
  }

  export namespace summary {
    export const select = (actor: IHubActorEntity) =>
      ({
        include: {
          elements: {
            where: {
              sale: {
                AND: HubSaleProvider.where(actor, true),
              },
            },
          },
          contents: HubSaleCollectionContentProvider.selectWithWhere(
            HubSaleCollectionContentProvider.json.select(),
            actor,
          ),
        },
      }) satisfies Prisma.hub_sale_collectionsFindManyArgs;

    export const transform = async (
      input: Prisma.hub_sale_collectionsGetPayload<ReturnType<typeof select>>,
      langCode: IHubCustomer.LanguageType,
    ): Promise<IHubSaleCollection.ISummary> => {
      const sale_count = input.elements.length;
      const found = input.contents.find((c) => c.lang_code === langCode);

      const content = found
        ? found
        : await HubSaleCollectionContentProvider.emplace({
            collection: { id: input.id },
            langCode: langCode,
          });

      return {
        id: input.id,
        title: content.title,
        summary: content.summary,
        body: content.body ?? null,
        background_color: typia.assert<IHubSaleCollection.CollectionColorType>(
          input.background_color,
        ),
        lang_code: content.lang_code,
        format: typia.assert<IHubSaleCollection.Type>(content.format),
        sale_count: sale_count,
        thumbnail: input.thumbnail,
        created_at: input.created_at.toISOString(),
      };
    };
  }

  export namespace admin {
    export const select = (actor: IHubActorEntity) =>
      ({
        include: {
          elements: {
            include: {
              sale: HubSaleProvider.summary.select(actor, "approved"),
            },
            where: {
              sale: {
                AND: HubSaleProvider.where(actor, true),
              },
            },
          },
          contents: HubSaleCollectionContentProvider.json.select(),
        },
      }) satisfies Prisma.hub_sale_collectionsFindManyArgs;

    export const transform = async (
      input: Prisma.hub_sale_collectionsGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubSaleCollection.IForAdmin> => {
      const sales = await ArrayUtil.asyncMap(
        input.elements.sort((a, b) => a.sequence - b.sequence),
      )((s) => HubSaleProvider.summary.transform(s.sale, lang_code));
      return {
        id: input.id,
        contents: input.contents.map(
          HubSaleCollectionContentProvider.json.transform,
        ),
        background_color: typia.assert<IHubSaleCollection.CollectionColorType>(
          input.background_color,
        ),
        sale_count: sales.length,
        thumbnail: input.thumbnail,
        sales: sales,
        created_at: input.created_at.toISOString(),
      };
    };
  }

  export const create = async (props: {
    admin: IHubAdministrator.IInvert;
    input: IHubSaleCollection.ICreate;
  }): Promise<IHubSaleCollection.IForAdmin> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.admin);
    const sale = await HubGlobal.prisma.hub_sales.findMany({
      where: {
        id: {
          in: props.input.sale_ids,
        },
      },
    });
    if (sale.length !== props.input.sale_ids.length) {
      throw ErrorProvider.notFound({
        code: HubSaleErrorCode.SALE_NOT_FOUND,
        message: "Unable to find some sales with matched id.",
      });
    }

    const collection = await HubGlobal.prisma.hub_sale_collections.create({
      data: await collect(props.input),
      ...admin.select(props.admin),
    });
    return admin.transform(collection, langCode);
  };

  const collect = async (input: IHubSaleCollection.ICreate) =>
    ({
      id: v4(),
      contents: {
        createMany: {
          data: input.contents.map(HubSaleCollectionContentProvider.collect),
        },
      },
      background_color: input.background_color,
      thumbnail: input.thumbnail,
      elements: {
        create: input.sale_ids.map(collectElement),
      },
      created_at: new Date(),
      updated_at: null,
    }) satisfies Prisma.hub_sale_collectionsCreateInput;

  const collectElement = (saleId: string, i: number) =>
    ({
      id: v4(),
      sale: {
        connect: {
          id: saleId,
        },
      },
      created_at: new Date(),
      sequence: i,
    }) satisfies Prisma.hub_sale_collection_elementsCreateWithoutCollectionInput;

  export const index = async (props: {
    actor: IHubActorEntity;
    input: IHubSaleCollection.IRequest;
  }): Promise<IPage<IHubSaleCollection.ISummary>> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);

    //todo 해당 패키지를 내가 다운로드 했는지 검증하는 로직이 필요함. (asher)
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_sale_collections,
      payload: summary.select(props.actor),
      transform: async (input) => await summary.transform(input, langCode),
    })({
      where: {
        elements: {
          some: {
            sale: {
              AND: HubSaleProvider.where(props.actor, true),
            },
          },
        },
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.hub_sale_collectionsFindManyArgs)(props.input);
  };

  const orderBy = (
    key: IHubSaleCollection.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "created_at"
      ? { created_at: value }
      : key === "updated_at"
        ? { updated_at: value }
        : {}) satisfies Prisma.hub_sale_collectionsOrderByWithRelationInput;

  export const atForAdmin = async (props: {
    actor: IHubActorEntity;
    id: string;
  }): Promise<IHubSaleCollection.IForAdmin> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    const collection = await HubGlobal.prisma.hub_sale_collections.findFirst({
      where: {
        id: props.id,
      },
      ...admin.select(props.actor),
    });
    if (collection === null) {
      throw ErrorProvider.notFound({
        code: HubSaleErrorCode.COLLECTION_NOT_FOUND,
        message: "Unable to find collection with matched id.",
      });
    }
    return admin.transform(collection, langCode);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    id: string;
  }): Promise<IHubSaleCollection> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    const collection = await HubGlobal.prisma.hub_sale_collections.findFirst({
      where: {
        id: props.id,
      },
      ...json.select(props.actor),
    });
    if (collection === null) {
      throw ErrorProvider.notFound({
        code: HubSaleErrorCode.COLLECTION_NOT_FOUND,
        message: "Unable to find collection with matched id.",
      });
    }
    return json.transform(collection, langCode);
  };

  export const erase = async (id: string): Promise<void> => {
    const collection = await HubGlobal.prisma.hub_sale_collections.findFirst({
      where: {
        id: id,
      },
    });

    if (collection === null) {
      throw ErrorProvider.notFound({
        code: HubSaleErrorCode.COLLECTION_NOT_FOUND,
        message: "Unable to find collection with matched id.",
      });
    }

    await HubGlobal.prisma.hub_sale_collections.delete({
      where: {
        id: id,
      },
    });
  };
}
