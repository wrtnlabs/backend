import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import {
  HttpMigration,
  IHttpMigrateApplication,
  OpenApi,
} from "@samchon/openapi";
import { v4 } from "uuid";

import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";

import { HubSaleSnapshotUnitContentProvider } from "./HubSaleSnapshotUnitContentProvider";
import { HubsaleSnapshotUnitOptionProvider } from "./HubSaleSnapshotUnitOptionProvider";
import { HubSaleSnapshotUnitStockProvider } from "./HubSaleSnapshotUnitStockProvider";
import { HubSaleSnapshotUnitSwaggerProvider } from "./HubSaleSnapshotUnitSwaggerProvider";

export namespace HubSaleSnapshotUnitProvider {
  export namespace summary {
    export const transform = async (
      input: Prisma.hub_sale_snapshot_unitsGetPayload<
        ReturnType<typeof select>
      >,
      _langCode: IHubCustomer.LanguageType,
    ): Promise<IHubSaleUnit.ISummary> => {
      return {
        id: input.id,
        name: input.to_contents[0].name,
        primary: input.primary,
        required: input.required,
        connector_icons: input.to_icons.map((i) => i.url),
      };
    };
    export const select = (langCode: string | null) =>
      ({
        // TODO
        //        select: {
        //          id: true,
        //          name: true,
        //          primary: true,
        //          required: true,
        //          sequence: true,
        //        },
        include: {
          to_icons: true,
          to_contents: HubSaleSnapshotUnitContentProvider.json.select(
            langCode ?? "en",
          ),
        },
      }) satisfies Prisma.hub_sale_snapshot_unitsFindManyArgs;
  }

  export namespace json {
    /// @todo Asher remove lanCode parameter
    export const transform = async (
      input: Prisma.hub_sale_snapshot_unitsGetPayload<
        ReturnType<typeof select>
      >,
      _langCode: IHubCustomer.LanguageType,
    ): Promise<IHubSaleUnit> => {
      // const found = input.to_contents.find((c) => c.lang_code === langCode);
      //
      // const name = found
      //   ? input.to_contents[0].name
      //   : await HubSaleSnapshotUnitContentProvider.emplace({
      //       langCode: langCode,
      //       unit: {
      //         id: input.id,
      //       },
      //     });

      return {
        id: input.id,
        name: input.to_contents[0].name,
        primary: input.primary,
        required: input.required,
        options: input.options
          .sort((a, b) => a.sequence - b.sequence)
          .map(HubsaleSnapshotUnitOptionProvider.json.transform),
        stocks: input.stocks
          .sort((a, b) => a.sequence - b.sequence)
          .map(HubSaleSnapshotUnitStockProvider.json.transform),
        connector_icons: input.to_icons.map((i) => i.url),
      };
    };
    export const select = (langCode: string | null) =>
      ({
        include: {
          to_contents: HubSaleSnapshotUnitContentProvider.json.select(
            langCode ?? "en",
          ),
          to_icons: true,
          options: HubsaleSnapshotUnitOptionProvider.json.select(),
          stocks: HubSaleSnapshotUnitStockProvider.json.select(),
        },
      }) satisfies Prisma.hub_sale_snapshot_unitsFindManyArgs;
  }

  export namespace invert {
    /// @todo Asher remove lanCode parameter
    export const transform = async (
      input: Prisma.hub_sale_snapshot_unitsGetPayload<
        ReturnType<typeof select>
      >,
      _langCode: IHubCustomer.LanguageType,
    ): Promise<Omit<IHubSaleUnit.IInvert, "stock">> => {
      // const found = input.to_contents.find((c) => c.lang_code === langCode);
      //
      // const name = found
      //   ? input.to_contents[0].name
      //   : await HubSaleSnapshotUnitContentProvider.emplace({
      //       langCode: langCode,
      //       unit: {
      //         id: input.id,
      //       },
      //     });

      return {
        id: input.id,
        name: input.to_contents[0].name,
        primary: input.primary,
        required: input.required,
        connector_icons: input.to_icons.map((i) => i.url),
      };
    };
    export const select = (langCode: string | null) =>
      ({
        //        select: { // TODO
        //          id: true,
        //          name: true,
        //          primary: true,
        //          required: true,
        //        },
        include: {
          to_icons: true,
          to_contents: HubSaleSnapshotUnitContentProvider.json.select(
            langCode ?? "en",
          ),
        },
      }) satisfies Prisma.hub_sale_snapshot_unitsFindManyArgs;
  }

  export const collect = async (props: {
    actor: IHubActorEntity;
    input: IHubSaleUnit.ICreate;
    sequence: number;
  }) => {
    const options = props.input.options.map((v, i) =>
      HubsaleSnapshotUnitOptionProvider.collect({
        input: v,
        sequence: i,
      }),
    );
    const { swagger, host } = await prepareUnitData(props);

    const migrate: IHttpMigrateApplication = HttpMigration.application(swagger);

    const icons: string[] = [
      ...new Set(
        migrate.routes
          .map((route) => route.operation()?.["x-wrtn-icon"])
          .filter((icon): icon is string => icon !== undefined),
      ),
    ];

    return {
      id: v4(),
      parent_id: props.input.parent_id,
      to_contents: {
        create: await ArrayUtil.asyncMap(props.input.contents)((c) =>
          HubSaleSnapshotUnitContentProvider.collect({
            name: c.name,
            original: c.original,
            lang_code: c.lang_code,
          }),
        ),
      },
      name:
        props.input.contents.find((c) => c.original === true)?.name ??
        props.input.contents[0].name,
      primary: props.input.primary,
      required: props.input.required,
      sequence: props.sequence,
      options: options.length
        ? {
            create: options,
          }
        : undefined,
      stocks: {
        create: props.input.stocks.map((v, i) =>
          HubSaleSnapshotUnitStockProvider.collect({
            options,
            input: v,
            sequence: i,
          }),
        ),
      },
      to_swagger: {
        create: await HubSaleSnapshotUnitSwaggerProvider.collect({
          host: host,
          document: swagger,
        }),
      },
      to_icons: {
        createMany: {
          data: icons.map((i) => ({
            id: v4(),
            url: i,
          })),
        },
      },
    } satisfies Prisma.hub_sale_snapshot_unitsCreateWithoutSnapshotInput;
  };

  async function prepareUnitData(props: {
    input: IHubSaleUnit.ICreate;
    actor: IHubActorEntity;
  }) {
    return {
      swagger: OpenApi.convert(props.input.swagger),
      host: {
        real: props.input.host.real,
        dev: props.input.host.dev,
      },
    };
  }
}
