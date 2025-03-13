import { v4 } from "uuid";

import { HubCartCommodityErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubCartCommodityErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";

import { HubSaleDiagnoser } from "../sales/HubSaleDiagnoser";
import { HubCartCommodityStockDiagnoser } from "./HubCartCommodityStockDiagnoser";

export namespace HubCartCommodityDiagnoser {
  export const validate =
    (sale: IHubSale) =>
    (input: IHubCartCommodity.ICreate): IDiagnosis[] => {
      // ABOUT SALE
      const output: IDiagnosis[] = HubSaleDiagnoser.readable(
        "$input.sale_id",
        true,
      )(sale);

      // ABOUT STOCKS
      input.stocks.forEach((stock, i) => {
        const unit: IHubSaleUnit | undefined = sale.units.find(
          (u) => u.id === stock.unit_id,
        );
        if (unit === undefined)
          output.push({
            accessor: `$input.stocks[${i}].unit_id`,
            code: HubCartCommodityErrorCode.UNIT_NOT_FOUND,
            message: `Unable to find the matched unit.`,
          });
        else
          output.push(
            ...HubCartCommodityStockDiagnoser.validatae(unit)({
              data: stock,
              index: i,
            }),
          );
      });
      return output;
    };

  export const replica = (
    commodity: IHubCartCommodity,
  ): IHubCartCommodity.ICreate => ({
    sale_id: commodity.sale.id,
    stocks: commodity.sale.units
      .map((unit) => ({
        unit_id: unit.id,
        stock_id: unit.stock.id,
        price_id: unit.stock.price.id,
        choices: unit.stock.choices.map((choice) => ({
          option_id: choice.option.id,
          candidate_id: choice.candidate?.id ?? null,
          value: choice.value,
        })),
      }))
      .flat(),
  });

  export const preview =
    (sale: IHubSale) =>
    (input: IHubCartCommodity.ICreate): IHubCartCommodity => ({
      id: v4(),
      sale: {
        ...sale,
        content: {
          id: v4(),
          lang_code: sale.content.lang_code,
          original: sale.content.original,
          title: sale.content.title,
          summary: sale.content.summary,
          version_description: sale.content.version_description,
          tags: sale.content.tags,
          icons: sale.content.icons,
        },
        units: input.stocks.map((stockInput) => {
          const unit: IHubSaleUnit | undefined = sale.units.find(
            (u) => u.id === stockInput.unit_id,
          );
          if (unit === undefined)
            throw new Error(
              `Error on HubCartItemDiagnoser.preview(): unable to find the matched unit by its id "${stockInput.unit_id}".`,
            );
          return {
            id: unit.id,
            name: unit.name,
            primary: unit.primary,
            required: unit.required,
            stock: HubCartCommodityStockDiagnoser.preview(unit)(stockInput),
            connector_icons: unit.connector_icons,
          } satisfies IHubSaleUnit.IInvert;
        }),
      },
      pseudo: true,
      created_at: new Date().toISOString(),
    });
}
