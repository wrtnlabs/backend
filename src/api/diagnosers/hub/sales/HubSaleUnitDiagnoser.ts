import { OpenApi } from "@samchon/openapi";
import { v4 } from "uuid";

import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IHubSaleUnitOption } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitOption";
import { IHubSaleUnitStock } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStock";

import { IIndexedInput } from "../../common/IIndexedInput";
import { UniqueDiagnoser } from "../../common/UniqueDiagnoser";
import { HubSaleUnitOptionDiagnoser } from "./HubSaleUnitOptionDiagnoser";
import { HubSaleUnitStockDiagnoser } from "./HubSaleUnitStockDiagnoser";

export namespace HubSaleUnitDiagnoser {
  export const validate = (
    unit: IIndexedInput<IHubSaleUnit.ICreate>,
  ): IDiagnosis[] => {
    const accessor: string = `input.units[${unit.index}]`;
    const output: IDiagnosis[] = [];

    //----
    // OPTIONS
    //----
    output.push(
      ...UniqueDiagnoser.validate<IHubSaleUnitOption.ICreate>({
        key: (s) => s.name,
        message: (o, i) => ({
          accessor: `${accessor}.options[${i}]`,
          code: HubSaleErrorCode.EXIST_UNIT_OPTION_NAME,
          message: `Duplicated option name: "${o.name}"`,
        }),
      })(unit.data.options),
    );
    unit.data.options.forEach((option, i) =>
      output.push(
        ...HubSaleUnitOptionDiagnoser.validate(unit)({
          data: option,
          index: i,
        }),
      ),
    );

    //----
    // STOCKS
    //----
    if (unit.data.stocks.length === 0)
      output.push({
        accessor: `${accessor}.stocks.length`,
        code: HubSaleErrorCode.UNIT_STOCK_NOT_EXISTS,
        message: "No stock exists.",
      });
    else {
      const count: number = unit.data.options
        .map((o) =>
          o.type === "select" && o.variable ? o.candidates.length : 1,
        )
        .reduce((a, b) => a * b, 1);
      if (unit.data.stocks.length > count)
        output.push({
          accessor: `${accessor}.stocks.length`,
          code: HubSaleErrorCode.STOCK_INCORRECT_COUNT,
          message: `Incorrect number of stocks: must not over the ${count} but ${unit.data.stocks.length}.`,
        });
    }

    output.push(
      ...UniqueDiagnoser.validate<IHubSaleUnitStock.ICreate>({
        key: (s) => s.name,
        message: (o, i) => ({
          accessor: `${accessor}.stocks[${i}]`,
          code: HubSaleErrorCode.EXIST_STOCK_NAME,
          message: `Duplicated stock name: "${o.name}"`,
        }),
      })(unit.data.stocks),
    );

    return output;
  };

  export const preview =
    (connectorIcon: string[] | null) =>
    (input: IHubSaleUnit.ICreate): IHubSaleUnit => {
      const options: IHubSaleUnitOption[] = input.options.map(
        HubSaleUnitOptionDiagnoser.preview,
      );
      return {
        id: v4(),
        name: input.contents[0].name,
        primary: input.primary,
        required: input.required,
        options,
        stocks: input.stocks.map(HubSaleUnitStockDiagnoser.preview(options)),
        connector_icons: connectorIcon ?? [],
      };
    };

  export const replica =
    (document: OpenApi.IDocument) =>
    (
      unit: IHubSaleUnit,
      unitContents: IHubSaleUnit.IUnitContent[],
    ): IHubSaleUnit.ICreate => {
      return {
        parent_id: unit.id,
        contents: unitContents,
        primary: unit.primary,
        required: unit.required,
        swagger: document,
        host: {
          real: document.servers?.[0].url!,
          dev: document.servers?.[1].url!,
        },
        options: unit.options.map(HubSaleUnitOptionDiagnoser.replica),
        stocks: unit.stocks.map(
          HubSaleUnitStockDiagnoser.replica(unit.options),
        ),
      };
    };
}
