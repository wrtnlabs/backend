import { OpenApi } from "@samchon/openapi";
import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { HubSystematicErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSystematicErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubSaleContent } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleContent";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IHubSaleAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/IHubSaleAggregate";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";
import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";
import typia from "typia";
import { v4 } from "uuid";

import { UniqueDiagnoser } from "../../common/UniqueDiagnoser";
import { HubChannelCategoryDiagnoser } from "../systematic/HubChannelCategoryDiagnoser";
import { HubSaleContentDiagnoser } from "./HubSaleContentDiagnoser";
import { HubSaleUnitDiagnoser } from "./HubSaleUnitDiagnoser";

export namespace HubSaleSnapshotDiagnoser {
  export const validate = (
    sale: IHubSaleSnapshot.ICreate,
    checkUnits: boolean = true,
  ): IDiagnosis[] => {
    const output: IDiagnosis[] = [];

    // CATEGORIES
    output.push(
      ...UniqueDiagnoser.validate<string>({
        key: (c) => c,
        message: (c, i) => ({
          code: HubSystematicErrorCode.CATEGORY_DUPICATED,
          accessor: `input.category_ids[${i}]`,
          message: `Duplicated category id: "${c}"`,
        }),
      })(sale.category_ids),
    );

    // UNITS
    if (checkUnits === true) {
      if (sale.units.length === 0)
        output.push({
          accessor: "input.units",
          code: HubSaleErrorCode.SNAPSHOT_UNIT_NOT_FOUND,
          message: "No unit",
        });
      else if (sale.units.every((u) => u.required === false))
        output.push({
          accessor: "input.units[].required",
          code: HubSaleErrorCode.SNAPSHOT_UNIT_NOT_FOUND,
          message: "No required unit",
        });

      sale.units
        .map((u) => u.contents)
        .forEach((c, ui) => {
          output.push(
            ...UniqueDiagnoser.validate<IHubSaleUnit.IUnitContent>({
              key: (u) => u.name,
              message: (u, i) => ({
                accessor: `input.units[${ui}].contents[${i}]`,
                code: HubSaleErrorCode.EXIST_SNAPSHOT_UNIT_NAME,
                message: `Duplicated unit name: "${u.name}"`,
              }),
            })(c),
          );
        });
      sale.units.forEach((unit, i) =>
        output.push(...HubSaleUnitDiagnoser.validate({ data: unit, index: i })),
      );
    }

    // PROPERTIES
    sale.contents.forEach((content, i) => {
      output.push(
        ...UniqueDiagnoser.validate<string>({
          key: (str) => str,
          message: (str, j) => ({
            accessor: `input.contents[${i}].tags[${j}]`,
            code: HubSaleErrorCode.EXIST_SNAPSHOT_TAG,
            message: `Duplicated tags: "${str}"`,
          }),
        })(content.tags),
      );
    });
    return output;
  };

  export const preview =
    (connectorIcon: string[] | null) =>
    (channel: IHubChannel.IHierarchical) =>
    (input: IHubSaleSnapshot.ICreate): IHubSaleSnapshot => {
      const categories: Map<string, IHubChannelCategory.IHierarchical> =
        new Map();
      HubChannelCategoryDiagnoser.associate(categories)(channel.categories);
      return {
        id: v4(),
        snapshot_id: v4(),
        latest: true,

        system_prompt: input.system_prompt,
        user_prompt_examples: input.user_prompt_examples,
        categories: input.category_ids.map((id) => {
          const category: IHubChannelCategory.IHierarchical | undefined =
            categories.get(id);
          if (category === undefined)
            throw new Error(
              `Error on HubSaleDiagnoser.preview(): unable to find the matched category by id "${id}"`,
            );
          return HubChannelCategoryDiagnoser.detail(categories)(category);
        }),
        // @todo remove legacy compatible code
        content: HubSaleContentDiagnoser.preview(
          input.contents.find((c) => c.original) ?? input.contents[0],
        ),
        version: input.version,
        aggregate: typia.random<IHubSaleAggregate>(), // @todo
        units: input.units.map(HubSaleUnitDiagnoser.preview(connectorIcon)),
        activated_at: null,
        expired_at: null,
      };
    };

  export const replica =
    (
      units: {
        unit_id: string;
        swagger: OpenApi.IDocument;
        contents: IHubSaleUnit.IUnitContent[];
      }[],
    ) =>
    (
      snapshot: IHubSaleSnapshot,
      contents: IHubSaleContent[],
    ): IHubSaleSnapshot.ICreate => ({
      category_ids: snapshot.categories.map((c) => c.id),
      contents: contents.map(HubSaleContentDiagnoser.replica),
      system_prompt: snapshot.system_prompt,
      user_prompt_examples: snapshot.user_prompt_examples.map((e) => ({
        ...e,
      })),
      units: snapshot.units.map((unit) => {
        const langUnit = units.find((s) => s.unit_id === unit.id);
        if (langUnit === undefined)
          throw new Error(`Unable to find the swagger by unit_id "${unit.id}"`);
        return HubSaleUnitDiagnoser.replica(langUnit.swagger)(
          unit,
          langUnit.contents,
        );
      }),
      version: snapshot.version,
    });
}
