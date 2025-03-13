import { RandomGenerator } from "@nestia/e2e";
import { randint } from "tstl";

import { IHubCartCommodityStock } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodityStock";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IHubSaleUnitStock } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStock";

export function prepare_random_cart_commodity_stock(
  unit: IHubSaleUnit,
  input: Partial<IHubCartCommodityStock.ICreate> = {},
): IHubCartCommodityStock.ICreate {
  const stock: IHubSaleUnitStock = RandomGenerator.pick(unit.stocks);
  return {
    unit_id: unit.id,
    stock_id: stock.id,
    price_id: RandomGenerator.pick(stock.prices).id,
    choices: [
      ...stock.choices.map((elem) => ({
        option_id: elem.option_id,
        candidate_id: elem.candidate_id,
        value: null,
      })),
      ...unit.options
        .filter((o) => o.type !== "select")
        .map((o) => ({
          option_id: o.id,
          candidate_id: null,
          value: String(
            o.type === "boolean"
              ? RandomGenerator.pick([true, false])
              : o.type === "number"
                ? randint(0, 100)
                : "something",
          ),
        })),
    ],
    ...input,
  };
}
