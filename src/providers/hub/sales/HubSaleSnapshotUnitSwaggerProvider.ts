import { Prisma } from "@prisma/client";
import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";
import { IEntity } from "@samchon/payment-api/lib/structures/common/IEntity";
import fs from "fs";
import { v4 } from "uuid";

import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSaleSnapshotUnitSwagger } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshotUnitSwagger";

import { HubConfiguration } from "../../../HubConfiguration";
import { HubGlobal } from "../../../HubGlobal";
import { SwaggerTranslateService } from "../../../services/SwaggerTranslateService";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { S3Util } from "../../../utils/S3Util";
import { HubSellerProvider } from "../actors/HubSellerProvider";
import { HubSaleSnapshotUnitSwaggerTranslateProvider } from "./HubSaleSnapshotUnitSwaggerTranslateProvider";

export namespace HubSaleSnapshotUnitSwaggerProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const select = () =>
      ({
        include: {
          to_translations: {
            where: {
              original: true,
            },
          },
        },
      }) satisfies Prisma.hub_sale_snapshot_unit_swaggersFindManyArgs;

    export const transform = async (
      input: Prisma.hub_sale_snapshot_unit_swaggersGetPayload<
        ReturnType<typeof select>
      >,
    ): Promise<IHubSaleSnapshotUnitSwagger> => {
      const translations = input.to_translations[0];
      const swagger: string =
        HubGlobal.testing === true
          ? await fs.promises.readFile(
              `${HubConfiguration.ROOT}/packages/swaggers/${translations.url.split("/").pop() || ""}.json`,
              "utf8",
            )
          : await S3Util.getObject(translations.url);
      return {
        id: input.id,
        server: {
          real: input.host_real,
          dev: input.host_dev,
        },
        lang_code: translations.lang_code ?? null,
        original: translations.original,
        swagger: JSON.parse(swagger),
      };
    };
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const at = async (props: {
    actor: IHubActorEntity | null;
    sale: IEntity;
    snapshot: IEntity;
    unit: IEntity;
  }): Promise<IHubSaleSnapshotUnitSwagger> => {
    // FIND MATCHED SWAGGER
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    const record =
      await HubGlobal.prisma.hub_sale_snapshot_unit_swaggers.findFirst({
        where: {
          unit: {
            id: props.unit.id,
            snapshot: {
              id: props.snapshot.id,
              sale: {
                id: props.sale.id,
                ...(props.actor !== null && props.actor.type === "seller"
                  ? HubSellerProvider.whereFromCustomerField(props.actor)
                  : {}),
              },
            },
          },
          to_translations: {
            some: {
              lang_code: langCode,
            },
          },
        },
        ...json.select(),
      });
    if (record !== null) return json.transform(record);

    // GET ORIGINAL SWAGGER
    const source: IHubSaleSnapshotUnitSwagger = await (async () => {
      const sourceRecord =
        await HubGlobal.prisma.hub_sale_snapshot_unit_swaggers.findFirstOrThrow(
          {
            where: {
              unit: {
                id: props.unit.id,
                snapshot: {
                  id: props.snapshot.id,
                  sale: {
                    id: props.sale.id,
                    ...(props.actor !== null && props.actor.type === "seller"
                      ? HubSellerProvider.whereFromCustomerField(props.actor)
                      : {}),
                  },
                },
              },
              to_translations: {
                some: {
                  original: true,
                },
              },
            },
            ...json.select(),
          },
        );
      return json.transform(sourceRecord);
    })();
    if (
      source.lang_code === null ||
      props.actor === null ||
      (props.actor.type === "customer" && props.actor.lang_code === null)
    )
      return source;
    //
    // // DO TRANSLATE
    // const translated: OpenApi.IDocument = await SwaggerTranslateService.translate({
    //   document: source.swagger,
    //   language: langCode,
    // });
    // await HubGlobal.prisma.hub_sale_snapshot_unit_swagger_translates.create({
    //   data: {
    //     swagger: {
    //       connect: {
    //         id: source.id,
    //       },
    //     },
    //     ...(await HubSaleSnapshotUnitSwaggerTranslateProvider.collect({
    //       swagger: translated,
    //       original: false,
    //       lang_code: langCode,
    //     })),
    //   },
    // });
    return source;
  };

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const collect = async (props: {
    host: {
      real: string;
      dev: string | null;
    };
    document:
      | SwaggerV2.IDocument
      | OpenApiV3.IDocument
      | OpenApiV3_1.IDocument
      | OpenApi.IDocument;
  }) => {
    const swagger: OpenApi.IDocument = OpenApi.convert(props.document);
    const langCode: string | undefined = await SwaggerTranslateService.detect({
      document: swagger,
    });
    return {
      id: v4(),
      host_dev: props.host.dev,
      host_real: props.host.real,
      to_translations: {
        create: await HubSaleSnapshotUnitSwaggerTranslateProvider.collect({
          swagger,
          lang_code: langCode ?? null,
          original: true,
        }),
      },
    } satisfies Prisma.hub_sale_snapshot_unit_swaggersCreateWithoutUnitInput;
  };
}
