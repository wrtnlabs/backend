import { v4 } from "uuid";

import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IHubSaleUnitOption } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitOption";
import { IHubSaleUnitStock } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStock";
import { IHubSaleUnitStockChoice } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStockChoice";

import { IIndexedInput } from "../../common/IIndexedInput";
import { UniqueDiagnoser } from "../../common/UniqueDiagnoser";
import { HubSaleUnitStockChoiceDiagnoser } from "./HubSaleUnitStockChoiceDiagnoser";
import { HubSaleUnitStockPriceDiagnoser } from "./HubSaleUnitStockPriceDiagnoser";

export namespace HubSaleUnitStockDiagnoser {
  export const validate =
    (unit: IIndexedInput<IHubSaleUnit.ICreate>) =>
    (stock: IIndexedInput<IHubSaleUnitStock.ICreate>): IDiagnosis[] => {
      const output: IDiagnosis[] = [];
      output.push(
        ...UniqueDiagnoser.validate<IHubSaleUnitStockChoice.ICreate>({
          key: (c) => JSON.stringify([c.option_index, c.candidate_index]),
          message: (c, i) => ({
            accessor: `input.units[${unit.index}].stocks[${stock.index}].choices[${i}]`,
            code: HubSaleErrorCode.STOCK_CHOICE_EXIST,
            message: `Duplicated choice: (${c.option_index}, ${c.candidate_index})`,
          }),
        })(stock.data.choices),
      );
      stock.data.choices.forEach((choice, i) => {
        output.push(
          ...HubSaleUnitStockChoiceDiagnoser.validate(unit)(stock)({
            data: choice,
            index: i,
          }),
        );
      });
      return output;
    };

  export const preview =
    (options: IHubSaleUnitOption[]) =>
    (input: IHubSaleUnitStock.ICreate): IHubSaleUnitStock => ({
      id: v4(),
      name: input.name,
      choices: input.choices.map(
        HubSaleUnitStockChoiceDiagnoser.preview(options),
      ),
      prices: input.prices.map(HubSaleUnitStockPriceDiagnoser.preview),
    });

  export const replica =
    (options: IHubSaleUnitOption[]) =>
    (input: IHubSaleUnitStock): IHubSaleUnitStock.ICreate => ({
      name: input.name,
      choices: input.choices.map(
        HubSaleUnitStockChoiceDiagnoser.replica(options),
      ),
      prices: input.prices.map(HubSaleUnitStockPriceDiagnoser.replica),
    });
}
