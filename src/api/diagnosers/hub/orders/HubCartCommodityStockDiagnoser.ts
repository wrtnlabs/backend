import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubCartCommodityStock } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodityStock";
import { IHubCartCommodityStockChoice } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodityStockChoice";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IHubSaleUnitStock } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStock";
import { IHubSaleUnitStockChoice } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStockChoice";
import { IHubSaleUnitStockPrice } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStockPrice";

import { IIndexedInput } from "../../common/IIndexedInput";
import { HubCartCommodityStockChoiceDiagnoser } from "./HubCartCommodityStockChoiceDiagnoser";

export namespace HubCartCommodityStockDiagnoser {
  export const validatae =
    (unit: IHubSaleUnit) =>
    (input: IIndexedInput<IHubCartCommodityStock.ICreate>): IDiagnosis[] => {
      const output: IDiagnosis[] = [];
      input.data.choices.forEach((choice, i) => {
        HubCartCommodityStockChoiceDiagnoser.validate(unit)(input.index)({
          data: choice,
          index: i,
        });
      });
      const stock: IHubSaleUnitStock | undefined = find(unit)(input.data);
      if (undefined === stock)
        output.push({
          accessor: `$input.stocks[${input.index}]`,
          code: HubSaleErrorCode.UNIT_STOCK_NOT_FOUND,
          message: `Unable to find the matched stock.`,
        });
      else if (input.data.stock_id !== stock.id)
        output.push({
          accessor: `$input.stocks[${input.index}].stock_id`,
          code: HubSaleErrorCode.UNIT_STOCK_NOT_FOUND,
          message: `The stock_id is not matched with choices.`,
        });
      else if (stock.prices.some((p) => p.id === input.data.price_id) === false)
        output.push({
          accessor: `$input.stocks[${input.index}].price_id`,
          code: HubSaleErrorCode.STOCK_PRICE_NOT_FOUND,
          message: `Unable to find the matched price.`,
        });
      return output;
    };

  export const find =
    (unit: IHubSaleUnit) =>
    (input: IHubCartCommodityStock.ICreate): IHubSaleUnitStock | undefined => {
      if (unit.stocks.length === 1 && unit.stocks[0].choices.length === 0)
        return unit.stocks[0];

      const choices: IHubCartCommodityStockChoice.ICreate[] =
        input.choices.filter(
          (choice) =>
            choice.candidate_id !== null &&
            unit.options.find(
              (o) =>
                o.id === choice.option_id &&
                o.type === "select" &&
                o.variable === true,
            ) !== undefined,
        );
      for (const stock of unit.stocks) {
        const matched: IHubSaleUnitStockChoice[] = stock.choices.filter(
          (elem) =>
            elem.candidate_id !== null &&
            choices.find(
              (choice) =>
                choice.option_id === elem.option_id &&
                choice.candidate_id === elem.candidate_id,
            ) !== undefined,
        );
        if (choices.length === matched.length) return stock;
      }
      return undefined;
    };

  export const preview =
    (unit: IHubSaleUnit) =>
    (input: IHubCartCommodityStock.ICreate): IHubSaleUnitStock.IInvert => {
      const stock: IHubSaleUnitStock | undefined = find(unit)(input);
      if (stock === undefined)
        throw new Error("Unable to find the matched stock.");

      const price: IHubSaleUnitStockPrice | undefined = stock.prices.find(
        (p) => p.id === input.price_id,
      );
      if (price === undefined)
        throw new Error("Unable to find the matched price.");
      return {
        id: stock.id,
        name: stock.name,
        price: {
          id: price.id,
          threshold: price.threshold,
          fixed: {
            value: price.fixed,
            deposit: price.fixed,
            ticket: 0,
          },
          variable: {
            value: price.variable,
            deposit: price.variable,
            ticket: 0,
          },
        },
        choices: input.choices.map((raw) => {
          const choice = stock.choices.find(
            (c) =>
              c.option_id === raw.option_id &&
              c.candidate_id === raw.candidate_id,
          );
          if (choice === undefined)
            throw new Error("Unable to find the matched choice.");
          const option = unit.options.find((o) => o.id === choice.option_id);
          if (option === undefined)
            throw new Error("Unable to find the matched option.");
          return {
            id: choice.id,
            option,
            candidate:
              option.type === "select" && raw.candidate_id !== null
                ? (option.candidates.find((c) => c.id === raw.candidate_id) ??
                  null)
                : null,
            value: raw.value,
          };
        }),
      };
    };
}
