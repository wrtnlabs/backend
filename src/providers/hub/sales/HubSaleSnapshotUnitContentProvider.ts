import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";

import { HubGlobal } from "../../../HubGlobal";
import { TranslateService } from "../../../services/TranslateService";

export namespace HubSaleSnapshotUnitContentProvider {
  export namespace json {
    export const select = (_langCode: string) => {
      return {
        where: {
          original: true,
        },
      } satisfies Prisma.hub_sale_snapshot_unit_contentsFindManyArgs;
    };
  }

  export const emplace = async (props: {
    langCode: string;
    unit: IEntity;
  }): Promise<string> => {
    const record =
      await HubGlobal.prisma.hub_sale_snapshot_unit_contents.findFirst({
        where: {
          hub_sale_snapshot_unit_id: props.unit.id,
          lang_code: props.langCode,
        },
      });

    if (record !== null) return record.name;

    const sourceRecord =
      await HubGlobal.prisma.hub_sale_snapshot_unit_contents.findFirstOrThrow({
        where: {
          hub_sale_snapshot_unit_id: props.unit.id,
          original: true,
        },
      });

    const translated = await TranslateService.api.translate({
      target: props.langCode,
      input: {
        name: sourceRecord.name,
      },
    });

    await HubGlobal.prisma.hub_sale_snapshot_unit_contents.create({
      data: {
        id: v4(),
        name: translated.name,
        original: false,
        lang_code: props.langCode,
        unit: {
          connect: {
            id: sourceRecord.hub_sale_snapshot_unit_id,
          },
        },
      },
    });

    return translated.name;
  };

  export const collect = async (input: IHubSaleUnit.IUnitContent) =>
    ({
      id: v4(),
      lang_code:
        input.lang_code ??
        (await TranslateService.api.detect({
          input: {
            title: input.name,
          },
        })) ??
        "en",
      name: input.name,
      original: input.original,
    }) satisfies Prisma.hub_sale_snapshot_unit_contentsCreateWithoutUnitInput;
}
