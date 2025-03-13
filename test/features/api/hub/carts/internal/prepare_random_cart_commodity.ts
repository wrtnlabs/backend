import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { prepare_random_cart_commodity_stock } from "./prepare_random_cart_commodity_stock";

export function prepare_random_cart_commodity(
  sale: IHubSale,
  input: Partial<IHubCartCommodity.ICreate> = {},
): IHubCartCommodity.ICreate {
  return {
    sale_id: sale.id,
    stocks: sale.units.map((unit) => prepare_random_cart_commodity_stock(unit)),
    ...input,
  };
}
